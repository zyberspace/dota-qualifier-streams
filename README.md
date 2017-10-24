Dota qualifier streams monorepo
===============================

This is a monorepository that holds the multiple projects related to [oracle.surge.sh](https://oracle.surge.sh), a site that allows you to see which casters are currently streaming the qualifiers. Click on a folder to get to the projects own READMEs.

*The streams on the site are administrated by the same people that run the [Dota2Qualifiers twitter](https://twitter.com/Dota2Qualifiers). I only created the projects described here to help them and have nothing to do with the actual streams listed on the site.*

I never got to open source all previously used projects and am currently in the state of rewriting most of the backend as a lot has changed due the new [Dota Pro Circuit](https://www.dota2.com/procircuit) (2 Major, 1 TI Qualifier per year to now probably more than one qualifer per week). Only the new projects or the ones that still get used will be held in this repository.

This is the planned stack for the near future:

  - A json data file hosted on Amazon S3 that contains the current streams and maybe some site config. The file contains a special `_version` key which increases with every version so clients can make sure they are in sync.
  - A public AWS IoT topic / stream from which subscribed clients retrieve changes made to the json data file. The update messages are basically [JSON Merge patches](https://tools.ietf.org/html/rfc7396), just that our version also allows us to partially update arrays. See [`mergePatch.js` in `oracle.surge.sh`](oracle.surge.sh/src/mergePatch.js) for more information.
  - A set of lambda functions available through Amazon API Gateway to update the json data file and publish the changes to AWS IoT.
  - A new minimal admin interface that allows you to add and delete streams through the lambda functions above. Updates are retrieved via the AWS IoT stream.
  - And finally the main static site hosted on [oracle.surge.sh](https://oracle.surge.sh) where everyone can see the current qualifier streams. The site flow will be as follows:
    - Wait till the javascript is loaded.
    - Load the json data file containing the streams and display them.
    - At the same time, connect to the AWS IoT stream.
    - Update the streams on the site whenever we receive changes through AWS IoT.
      - If the updated `_version` key doesn't match our current version, load the json data file again from S3 for a full update.

Before i found out that i can [use](https://serverless.com/blog/serverless-notifications-on-aws/) AWS IoT for this kind of thing i used another project which was providing an [Event Source Server](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) that got the streams from the old redis pubsub and could be deployed on as many physical servers as needed for scaling purpose. It was the previous data source for [oracle.surge.sh](https://oracle.surge.sh). If someone needs the source for this just send me a mail to the address in my profile. I may publish it as open source one day but it's really just a nodejs http server that redirects the messages it retrieves via redis pubsub to all connected event source clients.
