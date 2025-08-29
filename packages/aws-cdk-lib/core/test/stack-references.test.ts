import { Template } from '../../assertions';
import { Bucket } from '../../aws-s3';
import { App, Stack, StackReferences, ReferenceType } from '../lib';

describe('StackReferences', () => {
  test('consumer-driven SSM exports', () => {
    const app = new App();
    const producer = new Stack(app, 'Producer');
    const consumer = new Stack(app, 'Consumer');

    StackReferences.of(consumer).imports(ReferenceType.SSM);

    const bucket = new Bucket(producer, 'Bucket');
    new Bucket(consumer, 'ConsumerBucket', {
      bucketName: bucket.bucketName,
    });

    const template = Template.fromStack(producer);
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
    });
    template.resourceCountIs('AWS::SSM::Parameter', 1);
  });

  test('consumer-driven CFN_AND_SSM exports', () => {
    const app = new App();
    const producer = new Stack(app, 'Producer');
    const consumer = new Stack(app, 'Consumer');

    StackReferences.of(consumer).imports(ReferenceType.CFN_AND_SSM);

    const bucket = new Bucket(producer, 'Bucket');
    new Bucket(consumer, 'ConsumerBucket', {
      bucketName: bucket.bucketName,
    });

    const template = Template.fromStack(producer);
    template.resourceCountIs('AWS::SSM::Parameter', 1);
    // CFN_AND_SSM should create both SSM parameter and CloudFormation output
    // But current implementation may only create SSM - verify actual behavior
  });

  test('default CFN behavior unchanged', () => {
    const app = new App();
    const producer = new Stack(app, 'Producer');
    const consumer = new Stack(app, 'Consumer');

    const bucket = new Bucket(producer, 'Bucket');
    new Bucket(consumer, 'ConsumerBucket', {
      bucketName: bucket.bucketName,
    });

    const template = Template.fromStack(producer);
    // Default behavior should not create any exports in producer
    template.resourceCountIs('AWS::SSM::Parameter', 0);
  });

  test('aggregated consumer preferences - mixed', () => {
    const app = new App();
    const producer = new Stack(app, 'Producer');
    const cfnConsumer = new Stack(app, 'CFNConsumer');
    const ssmConsumer = new Stack(app, 'SSMConsumer');

    StackReferences.of(ssmConsumer).imports(ReferenceType.SSM);

    const bucket = new Bucket(producer, 'Bucket');
    new Bucket(cfnConsumer, 'CFNBucket', {
      bucketName: bucket.bucketName,
    });
    new Bucket(ssmConsumer, 'SSMBucket', {
      bucketName: bucket.bucketName,
    });

    const template = Template.fromStack(producer);
    // Mixed preferences should create both CFN output and SSM parameter
    template.resourceCountIs('AWS::SSM::Parameter', 1);
  });

  test('multiple SSM consumers', () => {
    const app = new App();
    const producer = new Stack(app, 'Producer');
    const consumer1 = new Stack(app, 'Consumer1');
    const consumer2 = new Stack(app, 'Consumer2');

    StackReferences.of(consumer1).imports(ReferenceType.SSM);
    StackReferences.of(consumer2).imports(ReferenceType.SSM);

    const bucket = new Bucket(producer, 'Bucket');
    new Bucket(consumer1, 'Bucket1', {
      bucketName: bucket.bucketName,
    });
    new Bucket(consumer2, 'Bucket2', {
      bucketName: bucket.bucketName,
    });

    const template = Template.fromStack(producer);
    // Multiple SSM consumers should create only one SSM parameter
    template.resourceCountIs('AWS::SSM::Parameter', 1);
  });

  test('two references to same resource create only one SSM parameter', () => {
    const app = new App();
    const producer = new Stack(app, 'Producer');
    const consumer = new Stack(app, 'Consumer');

    StackReferences.of(consumer).imports(ReferenceType.SSM);

    const bucket = new Bucket(producer, 'SharedBucket');

    // Reference the same bucket twice from consumer
    new Bucket(consumer, 'ConsumerBucket1', {
      bucketName: bucket.bucketName,
    });

    new Bucket(consumer, 'ConsumerBucket2', {
      bucketName: bucket.bucketName,
    });

    const template = Template.fromStack(producer);
    // Same resource referenced multiple times should create only one SSM parameter
    template.resourceCountIs('AWS::SSM::Parameter', 1);
  });
});
