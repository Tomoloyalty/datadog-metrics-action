import * as core from '@actions/core'
import * as dd from './datadog'
import * as yaml from 'js-yaml'

async function run(): Promise<void> {
  try {
    const datadogRegion: string = core.getInput('datadog-region')
    const ddDomainSuffix = (datadogRegion.toUpperCase() === 'EU')? 'eu' : 'com'
    const apiKey: string = core.getInput('api-key')

    const github: any = JSON.parse(core.getInput('github-context'))
    const globalTags: string[] = yaml.safeLoad(core.getInput('global-tags'))
    const result: string = core.getInput('result')
    const envName: string = core.getInput('env-name')

    addDefaultGlobalTags(globalTags, github, result, envName);
    await createEvents(ddDomainSuffix, apiKey, globalTags, github, result)
    await createMetrics(ddDomainSuffix, apiKey, globalTags)

  } catch (error) {
    console.log("Error")
    console.log(`Run failed: ${error?.message}`)
    core.setFailed(`Run failed: ${error?.message}`)
  }
}

function addDefaultGlobalTags(globalTags: string[], github: any, result: string, envName: string) {
  globalTags.push("project:" + github["repository"])
  globalTags.push("branch:" + github["ref"])
  globalTags.push("repo_owner:" + github["repository_owner"])
  globalTags.push("build_number:" + github["run_number"])
  globalTags.push("commit_sha:" + github["sha"])
  globalTags.push("actor:" + github["actor"])
  globalTags.push("source:" + "github")
  globalTags.push("build_result:" + result)
  globalTags.push("env:" + envName)
}

async function createEvents(ddDomainSuffix: string, apiKey: string, globalTags: string[], github: any, result: string): Promise<void> {

  const events: dd.Event[] = yaml.safeLoad(core.getInput('events'))
  const event: dd.Event = {
    title: `# ${ github?.run_number } - ${ github?.repository } Build Result: ${ result }`,
    text: `Commit ${ github["sha"] } : ${ github?.event?.head_commit?.message } -by: ${ github?.event?.head_commit?.author?.name }`,
    alert_type: result === 'failure' ? 'error' : result,
    host: github?.repository_owner,
    tags: []
  }
  events.push(event)
  await dd.sendEvents(ddDomainSuffix, apiKey, events, globalTags)
}

async function createMetrics(ddDomainSuffix: string, apiKey: string, globalTags: string[]) : Promise<void>{
  const startTime: string = core.getInput('start-timestamp')
  const metrics: dd.Metric[] = yaml.safeLoad(core.getInput('metrics'))
  const metric: dd.Metric = {
    type: "count",
    name: "build.duration",
    value: (Date.now() - new Date(startTime).getTime())/1000,
    host: "Github",
    tags: []
  }
  metrics.push(metric)
  await dd.sendMetrics(ddDomainSuffix, apiKey, metrics, globalTags)
}

run()
