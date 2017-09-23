Dota qualifier streams monorepo
===============================

This is a monorepository that holds the multiple projects related to [oracle.surge.sh](https://oracle.surge.sh), a site that allows you to see which casters are currently streaming the qualifiers. Click on a folder to get to the projects own READMEs.

*The streams on the site are administrated by the same people that run the [Dota2Qualifiers twitter](https://twitter.com/Dota2Qualifiers). I only created the projects described here to help them and have nothing to do with the actual streams listed on the site.*

I never got to open source all previously used projects and am currently in the state of rewriting most of the backend as a lot has changed due the new [Dota Pro Circuit](https://www.dota2.com/procircuit) (2 Major, 1 TI Qualifier per year to now probably more than one qualifer per week). Only the new projects or the ones that still get used will be held in this repository.

This will be the stack till i have time for a full backend rewrite:

  - The closed-source admin interface that got written for the old-circuit and pumps the manually typed in streams into a redis server.
  - A bridge that takes the redis data and pushes it to AWS IoT, which will be the replacement for the currently used redis pubsub.
  - A Lambda method that allows the static frontend site to get temporary access keys for the AWS IoT pubsub stream as described [here](https://serverless.com/blog/serverless-notifications-on-aws/).
  - And finally the static frontend site hosted on [oracle.surge.sh](https://oracle.surge.sh) where all the above things come together and everyone can see the current qualifier streams. The new site "flow" will be as follows:
    - Wait till the javascript is loaded
    - Call the Lambda function via the API Gateway and get the IoT backend url, the region, the subscription url, some meta data, the current streams and of course our temporary access keys.
    - Connect to the IoT pubsub stream via secured websockets
    - Update the streams on the site whenever we receive new data through AWS IoT

Before i found out that i can use AWS IoT for this kind of thing i used another project which was providing an [Event Source Server](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) that got the streams from the redis pubsub and could be deployed on as many physical servers as needed for scaling purpose. It was the previous data source for [oracle.surge.sh]. If someone needs the source for this just send me a mail to the address in my profile. I may publish it as open source one day but it's really just a nodejs http server that redirects the messages it retrieves via redis pubsub to all connected event source clients.
