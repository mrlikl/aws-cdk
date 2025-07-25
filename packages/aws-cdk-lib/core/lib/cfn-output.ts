import { Construct } from 'constructs';
import { CfnElement } from './cfn-element';

export interface CfnOutputProps {
  /**
   * A String type that describes the output value.
   * The description can be a maximum of 4 K in length.
   *
   * @default - No description.
   */
  readonly description?: string;

  /**
   * The key of the property returned by aws cloudformation describe-stacks command.
   */
  readonly key?: string;

  /**
   * The value of the property returned by the aws cloudformation describe-stacks command.
   * The value of an output can include literals, parameter references, pseudo-parameters,
   * a mapping value, or intrinsic functions.
   */
  readonly value: string;

  /**
   * The name used to export the value of this output across stacks.
   *
   * To import the value from another stack, use `Fn.importValue(exportName)`.
   *
   * @default - the output is not exported
   */
  readonly exportName?: string;

  /**
   * A condition to associate with this output value. If the condition evaluates
   * to `false`, this output value will not be included in the stack.
   *
   * @default - No condition is associated with the output.
   */
  readonly condition?: CfnCondition;
}

export class CfnOutput extends CfnElement {
  private _description?: string;
  private _condition?: CfnCondition;
  private _key?: string;
  private _value?: any;
  private _exportName?: string;

  /**
   * Creates a CfnOutput value for this stack.
   * @param scope The parent construct.
   * @param props CfnOutput properties.
   */
  constructor(scope: Construct, id: string, props: CfnOutputProps) {
    super(scope, id);

    if (props.value === undefined) {
      throw new ValidationError(`Missing value for CloudFormation output at path "${this.node.path}"`, this);
    } else if (Array.isArray(props.value)) {
      // `props.value` is a string, but because cross-stack exports allow passing any,
      // we need to check for lists here.
      throw new ValidationError(`CloudFormation output was given a string list instead of a string at path "${this.node.path}"`, this);
    }

    this._description = props.description;
    this._key = props.key;
    this._value = props.value;
    this._condition = props.condition;
    this._exportName = props.exportName;

    this.node.addValidation({ validate: () => this.validateOutput() });
  }

  /**
   * A String type that describes the output value.
   * The description can be a maximum of 4 K in length.
   *
   * @default - No description.
   */
  public get description() {
    return this._description;
  }

  public set description(description: string | undefined) {
    this._description = description;
  }

  /**
   * The value of the property returned by the aws cloudformation describe-stacks command.
   * The value of an output can include literals, parameter references, pseudo-parameters,
   * a mapping value, or intrinsic functions.
   */
  public get value() {
    return this._value;
  }

  public set value(value: any) {
    this._value = value;
  }

  /**
   * A condition to associate with this output value. If the condition evaluates
   * to `false`, this output value will not be included in the stack.
   *
   * @default - No condition is associated with the output.
   */
  public get condition() {
    return this._condition;
  }

  public set condition(condition: CfnCondition | undefined) {
    this._condition = condition;
  }

  /**
   * The name used to export the value of this output across stacks.
   *
   * To use the value in another stack, pass the value of
   * `output.importValue` to it.
   *
   * @default - the output is not exported
   */
  public get exportName() {
    return this._exportName;
  }

  public set exportName(exportName: string | undefined) {
    this._exportName = exportName;
  }

  /**
   * Return the `Fn.importValue` expression to import this value into another stack
   *
   * The returned value should not be used in the same stack, but in a
   * different one. It must be deployed to the same environment, as
   * CloudFormation exports can only be imported in the same Region and
   * account.
   *
   * The is no automatic registration of dependencies between stacks when using
   * this mechanism, so you should make sure to deploy them in the right order
   * yourself.
   *
   * You can use this mechanism to share values across Stacks in different
   * Stages. If you intend to share the value to another Stack inside the same
   * Stage, the automatic cross-stack referencing mechanism is more convenient.
   */
  public get importValue() {
    // We made _exportName mutable so this will have to be lazy.
    return Fn.importValue(Lazy.uncachedString({
      produce: (ctx) => {
        if (Stack.of(ctx.scope) === this.stack) {
          throw new ValidationError(`'importValue' property of '${this.node.path}' should only be used in a different Stack`, this);
        }
        if (!this._exportName) {
          throw new ValidationError(`Add an exportName to the CfnOutput at '${this.node.path}' in order to use 'output.importValue'`, this);
        }

        return this._exportName;
      },
    }));
  }

  /**
   * @internal
   */
  public _toCloudFormation(): object {
    return {
      Outputs: {
        [this._key ?? this.logicalId]: {
          Description: this._description,
          Value: this._value,
          Export: this._exportName != null ? { Name: this._exportName } : undefined,
          Condition: this._condition ? this._condition.logicalId : undefined,
        },
      },
    };
  }

  private validateOutput(): string[] {
    const errors: string[] = [];
    if (this._exportName !== undefined && !Token.isUnresolved(this._exportName)) {
      if (this._exportName.length === 0) {
        errors.push('Export name cannot be empty');
      }
      if (this._exportName.length > 255) {
        errors.push(`Export name cannot exceed 255 characters (got ${this._exportName.length} characters)`);
      }
      if (!/^[A-Za-z0-9-:]*$/.test(this._exportName)) {
        errors.push(`Export name must only include alphanumeric characters, colons, or hyphens (got '${this._exportName}')`);
      }
    }
    return errors;
  }
}

/* eslint-disable import/order */
import { CfnCondition } from './cfn-condition';
import { Fn } from './cfn-fn';
import { Lazy } from './lazy';
import { Stack } from './stack';
import { Token } from './token';
import { ValidationError } from './errors';

