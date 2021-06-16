import xapi from 'xapi';

/********************************************************
 * Author: Robert McGonigle Jr, Video Services Engineer
 *         robertmcgoniglejr@gmail.com
 * 
 * Project Lead: Enrico Conedera
 * 
 * Release: 10/28/2020
 * Last Update: 11/4/2020
 * 
 * Name: USB_Main_1-3-0
 * Version: 1-3-0
 *  
 * Description:
 *    This script was designed to run once for 'projUSB_Main'
 *    It will capture and store KEY elements of your endpoint to later restore
 *    This will generate the UI for 'projUSB_Main'
 * 
 * Dependencies: 
 *    'memStoreV2':
 *        Memblock Indexes 0 - 12 are in use for 'projUSB_Main_1-1-0' and proj and 'USB_FirstTimeSetup_1-1-0'
********************************************************/

import { stored_Information, lastStore, memBlock, getMemInformation, memChain, memoryCapacity, updateMemBlock, sleep } from './memStoreV2';

function add_USB_UI() {
  //<Home, Never>
  xapi.command('UserInterface Extensions Panel Save', {
    PanelId: 'proUSB_Active_1-0-0'
  },
    `
<Extensions>
  <Version>1.7</Version>
  <Panel>
    <Order>3</Order>
    <Color>#FFA300</Color>
    <PanelId>proUSB_Active_1-0-0</PanelId>
    <Type>Home</Type>
    <Icon>Input</Icon>
    <Name>Disable USB mode</Name>
    <ActivityType>Custom</ActivityType>
  </Panel>
</Extensions>
`
  );
  xapi.command('UserInterface Extensions Panel Save', {
    PanelId: 'proUSB_Inactive_1-0-0'
  },
    `
<Extensions>
  <Version>1.7</Version>
  <Panel>
    <Order>3</Order>
    <Color>#335A9A</Color>
    <PanelId>proUSB_Inactive_1-0-0</PanelId>
    <Type>Home</Type>
    <Icon>Input</Icon>
    <Name>Enable USB mode</Name>
    <ActivityType>Custom</ActivityType>
  </Panel>
</Extensions>
`
  );
  updateMemBlock('Disabled', 11)
  xapi.command('UserInterface Extensions Panel Update', {
    PanelId: 'proUSB_Active_1-0-0',
    Visibility: 'Hidden'
  })
  xapi.config.set('UserInterface Features HideAll', 'False')
  xapi.command('UserInterface Extensions Panel Update', {
    PanelId: 'proUSB_Inactive_1-0-0',
    Visibility: 'Auto'
  })
}

function runSetupWizard() {
  xapi.command('UserInterface Message Alert Display', {
    Title: 'USB Mode First Time Setup',
    Text: 'Please allow the system a few seconds to configure itself and test.'
  })
  if (memBlock[11].value === 'Enabled') {
    console.error('USB Mode is enabled! Disabling USB mode...')
    updateMemBlock('Disabled', 11)
    xapi.command('UserInterface Extensions Panel Clicked', {
      PanelId: 'proUSB_Active_1-0-0'
    })
    return sleep(2000).then(() => {
      console.warn('runSetupWizard re-executing...')
      runSetupWizard()
    })
  } else {
    updateMemBlock('Complete', 0)
    xapi.config.get('Video Monitors').then((event) => {
      updateMemBlock(event, 1)
    });
    xapi.config.get('Video Output Connector 1 MonitorRole').then((event) => {
      updateMemBlock(event, 2)
    });
    xapi.config.get('Video Output Connector 2 MonitorRole').then((event) => {
      updateMemBlock(event, 3)
    });
    xapi.status.get('Video Selfview').then((event) => {
      updateMemBlock(event.FullscreenMode, 4)
      updateMemBlock(event.OnMonitorRole, 5)
      updateMemBlock(event.PIPPosition, 6)
      updateMemBlock(event.Mode, 7)
    });
    xapi.config.get('Audio Microphones AGC').then((event) => {
      updateMemBlock(event, 8)
    }).catch(e => {
      console.warn('Error Exception Handled');
      console.error(e);
    });;
    /** */
    xapi.config.get('Audio Output Line 1').then((event) => {
      updateMemBlock(event.Mode, 9)
      updateMemBlock(event.OutputType, 10)
    });
    /** */
    add_USB_UI()
    console.log('USB Setup complete, disabling set-up wizard');
    sleep(2000).then(() => {
      updateMemBlock('Enabled', 11)
      xapi.command('UserInterface Extensions Panel Clicked', {
        PanelId: 'proUSB_Inactive_1-0-0'
      })
      sleep(3000).then(() => {
        updateMemBlock('Disabled', 11)
        xapi.command('UserInterface Extensions Panel Clicked', {
          PanelId: 'proUSB_Active_1-0-0'
        })
        sleep(3000).then(() => {
          xapi.command('UserInterface Message Alert Display', {
            Title: 'Setup Complete!',
            Text: 'Thank you for your patience.<p>USB Mode is now ready for use.',
            Duration: 10
          })
          xapi.command('Macros Macro Activate', {
            Name: 'projUSB_Main_1-3-0'
          })
          xapi.command('Macros Macro Deactivate', {
            Name: 'projUSB_FirstTimeSetup_1-3-0'
          })
          xapi.command('Macros Runtime Restart')
        })
      })
    });
  }
}

getMemInformation()
sleep(1000).then(() => {
  runSetupWizard();
})