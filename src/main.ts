import * as core from '@actions/core'
import * as dd from './datadog'
import * as yaml from 'js-yaml'

async function run(): Promise<void> {
  try {
    const datadogRegion: string = core.getInput('datadog-region')
    const ddDomainSuffix = (datadogRegion.toUpperCase() === 'EU')? 'eu' : 'com'

    const apiKey: string = core.getInput('api-key')
    const globalTags: string[] = yaml.safeLoad(core.getInput('global-tags'))

    const result: string = core.getInput('result')
    const envName: string = core.getInput('env-name')

    const github: any = core.getInput('github-context')

    globalTags.push("project:"+ JSON.parse(github)["repository"])
    globalTags.push("branch:"+ JSON.parse(github)["ref"])
    globalTags.push("repo_owner:"+ JSON.parse(github)["repository_owner"])
    globalTags.push("build_number:"+ JSON.parse(github)["run_number"])
    globalTags.push("commit_sha:"+ JSON.parse(github)["sha"])
    globalTags.push("actor:"+ JSON.parse(github)["actor"])
    globalTags.push("source:"+ "github")
    globalTags.push("build_result:"+ result)
    globalTags.push("env:"+ envName)

    const metrics: dd.Metric[] = yaml.safeLoad(core.getInput('metrics'))
    await dd.sendMetrics(ddDomainSuffix, apiKey, metrics, globalTags)

    const events: dd.Event[] = yaml.safeLoad(core.getInput('events'))
    await dd.sendEvents(ddDomainSuffix, apiKey, events, globalTags)
  } catch (error) {
    console.log("Error")
    console.log(`Run failed: ${error.message}`)
    core.setFailed(`Run failed: ${error.message}`)
  }
}

run()
