import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AllowedMethods, CachedMethods, Distribution, OriginRequestPolicy, ResponseHeadersPolicy, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

const domainName = 'quincymitchell.com';
const ssmCertArn = '/prod/quincymitchell.com/acm/certArn';

export class QuincymitchellComStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const certArnParam = StringParameter.fromStringParameterName(this, 'ssmCertArn', ssmCertArn);

    const myBucket = new Bucket(this, 'bucket', {
      bucketName: `prod-${domainName}`,
      cors: [{
        allowedMethods: [HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*']
      }],
      enforceSSL: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN
    });
    const mycert = Certificate.fromCertificateArn(this, 'certificate', certArnParam.stringValue);

    new Distribution(this, 'myDist', {
      defaultBehavior: {
        origin: new S3Origin(myBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS, // needed for cors
        cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS, // needed for cors
      },
      errorResponses: [{ // for single page application router support
        httpStatus: 403, //forbidden
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
        ttl: Duration.seconds(10)
      }],
      defaultRootObject: 'index.html',
      domainNames: [domainName, `www.${domainName}`],
      certificate: mycert
    });
  }
}
