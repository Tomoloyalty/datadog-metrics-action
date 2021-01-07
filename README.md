
***********

# PUBLIC REPO

Currently Github actions require all Actions to be hosted in a public repo. 
Ensure NO sensitve information is present. 

***********


# Datadog Action


This Action lets you send events and metrics to Datadog from a GitHub workflow.

## Usage

Please note how `metrics` is defined as a string containing YAML code - this
allows to send more than one metric at once if needed. To send one metric,
configure a job step like the following:

```yaml
- name: Build count
  uses: masci/datadog@v1
  with:
    api-key: ${{ secrets.DATADOG_API_KEY }}
    metrics: |
      - type: "count"
        name: "test.runs.count"
        value: 1.0
        host: ${{ github.repository_owner }}
        tags:
          - "project:${{ github.repository }}"
          - "branch:${{ github.head_ref }}"
```

You can also send Datadog events from workflows, same as `metric` please note
how `events` is indeed a string containing YAML code. For example, an use case
might be sending an event when a job has failed:

```yaml
steps:
  - name: checkout
    uses: actions/checkout@v2
  - name: build
    run: this-will-fail
  - name: Datadog
    if: failure()
    uses: masci/datadog@v1
    with:
      api-key: ${{ secrets.DATADOG_API_KEY }}
      events: |
        - title: "Failed building Foo"
          text: "Branch ${{ github.head_ref }} failed to build"
          alert_type: "error"
          host: ${{ github.repository_owner }}
          tags:
            - "project:${{ github.repository }}"
```

## Development

Install the dependencies
```bash
$ npm install
```


Run the tests :heavy_check_mark:
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```


## Build and Push 

Build the typescript and package it for distribution
```bash
$ npm run build && npm run pack
$ git commit ...
$ git push ...
```

## Create a new Release Version 



