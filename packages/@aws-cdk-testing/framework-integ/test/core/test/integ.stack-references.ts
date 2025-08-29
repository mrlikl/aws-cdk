import { App, Stack, StackReferences, ReferenceType } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as integ from '@aws-cdk/integ-tests-alpha';

const app = new App();

const producer = new Stack(app, 'StackReferencesProducer');
const consumer = new Stack(app, 'StackReferencesConsumer');

StackReferences.of(consumer).imports(ReferenceType.CFN_AND_SSM);

const bucket = new Bucket(producer, 'SharedBucket');
new Bucket(consumer, 'ConsumerBucket', {
  bucketName: `copy-${bucket.bucketName}`,
});

new integ.IntegTest(app, 'StackReferencesIntegTest', {
  testCases: [producer, consumer],
});
