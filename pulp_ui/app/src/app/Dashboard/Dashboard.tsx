import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, textCenter } from '@patternfly/react-table';
import styles from '@patternfly/react-styles/css/components/Table/table';

import * as PulpCoreClient from '@app/pulpcore-client';
import * as PulpFileClient from '@app/pulp_file-client';

const pulpConfig = new PulpCoreClient.Configuration({username: 'admin', password: 'password', basePath: 'http://localhost:9000'});
const fileConfig = new PulpFileClient.Configuration({username: 'admin', password: 'password', basePath: 'http://localhost:9000'});

const statusApi = new PulpCoreClient.StatusApi(pulpConfig);
const taskApi = new PulpCoreClient.TasksApi(pulpConfig)
const repoApi = new PulpFileClient.RepositoriesFileApi(fileConfig);
const remoteApi = new PulpFileClient.RemotesFileApi(fileConfig)
const FINISHED_TASK_STATES = ["skipped", "completed", "failed", "canceled"]

const sleep = function(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const monitorTask = async function(taskHref: string) {
  while(true) {
    let result = await taskApi.read(taskHref)
    if(FINISHED_TASK_STATES.indexOf(result["data"]["state"]) > -1) {
      return result
    }
    await sleep(500)
  }
}

//let resp = statusApi.statusRead()
//resp.then((result) => {
    //console.log("Status:")
    //console.log(result["data"])
//})

//repoApi.list().then((result) => {
  //console.log("Repositories:")
  //console.log(result["data"]["results"])
//})

let testid = Math.random()
remoteApi.create({name: "test-remote-" + testid, url: "https://fixtures.pulpproject.org/file/PULP_MANIFEST"}).then((remoteResult) => {
  let remote = remoteResult["data"]

  repoApi.create({name: "test-repo-" + testid, remote: remote["pulp_href"]}).then((repoResult) => {
    console.log("Repo create result:")
    console.log(repoResult["data"])

    // do a sync
    repoApi.sync(repoResult["data"]["pulp_href"], {}).then((syncResult) => {
      monitorTask(syncResult["data"]["task"]).then((taskResult) => {
        console.log("Repo sync result:")
        console.log(taskResult["data"])
      })
    })
  })
})

    const state = {
      columns: [
        { 
          title: 'Repositories',
          header: {
            info: {
              tooltip: 'More information about repositories',
              className: 'repositories-info-tip',
              tooltipProps: {
                isContentLeftAligned: true
              }
            }
          }
        },
        'Branches',
        { 
          title: 'Pull requests',
          header: {
            info: {
              popover: <div>More <strong>information</strong> on pull requests</div>,
              ariaLabel: 'More information on pull requests',
              popoverProps: {
                headerContent: 'Pull requests',
                footerContent: <a href="">Click here for even more info</a>
              }
            }
          }
        },
        'Workspaces',
        {
          title: 'Last Commit',
          transforms: [textCenter],
          cellTransforms: [textCenter]
        }
      ],
      rows: [
        {
          cells: ['one', 'two', 'three', 'four', 'five']
        },
        {
          cells: [
            {
              title: <div>one - 2</div>,
              props: { title: 'hover title', colSpan: 3 }
            },
            'four - 2',
            'five - 2'
          ]
        },
        {
          cells: [
            'one - 3',
            'two - 3',
            'three - 3',
            'four - 3',
            {
              title: 'five - 3 (not centered)',
              props: { textCenter: false }
            }
          ]
        }
      ]
    };

const Dashboard: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg">Dashboard Page Titles</Title>
      <Table aria-label="Simple Table" cells={state.columns} rows={state.rows}>
        <TableHeader className={styles.modifiers.nowrap}/>
        <TableBody />
      </Table>
  </PageSection>
)

export { Dashboard };
