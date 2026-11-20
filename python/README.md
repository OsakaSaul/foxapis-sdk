# foxapis (Python)

Tiny client generated from https://foxapis.com/openapi.json (v1.5.0). One method per operation (99), job polling included. Standard library only; Python 3.8+.

```python
import os
from foxapis import FoxAPIs
fox = FoxAPIs(os.environ["FOXAPIS_KEY"])  # free trial key: https://foxapis.com/trial
print(fox.score_intent({"text": "Anyone know a cheaper alternative to Mailchimp?", "platform": "reddit"}))
job = fox.candidate_evaluate({"candidateName": "Jane Example", "jobDescription": "Head of Growth"})
print(fox.wait_for_job(job))  # async methods answer 202 with a job id
```

Credits per call are in each method's docstring; prices are on https://foxapis.com/pricing . Generated 2026-11-18.
