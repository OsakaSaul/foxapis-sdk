# foxapis (JavaScript)

Tiny client generated from https://foxapis.com/openapi.json (v1.5.0). One method per operation (99), job polling included. No dependencies; Node 18+.

```js
import { FoxAPIs } from "./index.mjs";
const fox = new FoxAPIs({ apiKey: process.env.FOXAPIS_KEY }); // free trial key: https://foxapis.com/trial
console.log(await fox.scoreIntent({ text: "Anyone know a cheaper alternative to Mailchimp?", platform: "reddit" }));
const job = await fox.candidateEvaluate({ candidateName: "Jane Example", jobDescription: "Head of Growth" });
console.log(await fox.waitForJob(job)); // async methods answer 202 with a job id
```

Credits per call are in each method's description; prices are on https://foxapis.com/pricing . Generated 2026-11-18.
