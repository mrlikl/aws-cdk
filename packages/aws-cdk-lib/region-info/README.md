# AWS Region-Specific Information Directory

## Usage

Some information used in CDK Applications differs from one AWS region to
another, such as service principals used in IAM policies, S3 static website
endpoints, ...

### The `RegionInfo` class

The library offers a simple interface to obtain region specific information in
the form of the `RegionInfo` class. This is the preferred way to interact with
the regional information database:

```ts
// Get the information for "eu-west-1":
const region = regionInfo.RegionInfo.get('eu-west-1');

// Access attributes:
region.s3StaticWebsiteEndpoint; // s3-website-eu-west-1.amazonaws.com
```

The `RegionInfo` layer is built on top of the Low-Level API, which is described
below and can be used to register additional data, including user-defined facts
that are not available through the `RegionInfo` interface.

### Low-Level API

This library offers a primitive database of such information so that CDK
constructs can easily access regional information. The `FactName` class provides
a list of known fact names, which can then be used with the `RegionInfo` to
retrieve a particular value:

```ts
const staticWebsite = regionInfo.Fact.find(
  'ap-northeast-1',
  regionInfo.FactName.S3_STATIC_WEBSITE_ENDPOINT
);
// => s3-website-ap-northeast-1.amazonaws.com
```

## Supplying new or missing information

As new regions are released, it might happen that a particular fact you need is
missing from the library. In such cases, the `Fact.register` method can be used
to inject FactName into the database:

```ts
class MyFact implements regionInfo.IFact {
  public readonly region = 'bermuda-triangle-1';
  public readonly name = regionInfo.FactName.S3_STATIC_WEBSITE_ENDPOINT;
  public readonly value = 's3-website.bermuda-triangle-1.nowhere.com';
}

regionInfo.Fact.register(new MyFact());
```

## Overriding incorrect information

In the event information provided by the library is incorrect, it can be
overridden using the same `Fact.register` method demonstrated above, simply
adding an extra boolean argument:

```ts
class MyFact implements regionInfo.IFact {
  public readonly region = 'us-east-1';
  public readonly name = regionInfo.FactName.S3_STATIC_WEBSITE_ENDPOINT;
  public readonly value = 'the-correct-endpoint.amazonaws.com';
}

regionInfo.Fact.register(new MyFact(), true /* Allow overriding information */);
```

If you happen to have stumbled upon incorrect data built into this library, it
is always a good idea to report your findings in a [GitHub issue], so we can fix
it for everyone else!

[GitHub issue]: https://github.com/aws/aws-cdk/issues

---

This module is part of the [AWS Cloud Development Kit](https://github.com/aws/aws-cdk) project.
