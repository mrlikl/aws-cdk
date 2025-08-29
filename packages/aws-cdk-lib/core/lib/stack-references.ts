import { IConstruct } from 'constructs';

/**
 * Reference types for cross-stack dependencies
 */
export enum ReferenceType {
  /**
   * Use CloudFormation exports/imports (default)
   */
  CFN = 'CFN',

  /**
   * Use SSM parameters
   */
  SSM = 'SSM',

  /**
   * Use both CloudFormation exports and SSM parameters
   */
  CFN_AND_SSM = 'CFN_AND_SSM',
}

/**
 * Configure how cross-stack references are handled for a construct scope
 */
export class StackReferences {
  /**
   * Get StackReferences for a construct scope
   */
  public static of(scope: IConstruct): StackReferences {
    return new StackReferences(scope);
  }

  private constructor(private readonly scope: IConstruct) {}

  /**
   * Configure what type of imports this scope wants from producers
   * This affects how cross-stack references are resolved when this scope
   * references resources from other stacks.
   */
  public imports(type: ReferenceType): void {
    this.scope.node.setContext('aws-cdk:stack-references:exports', type);
  }
}
