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
 * Name: USB_FirstTimeSetup_1-3-0
 * Version: 1-3-0
 *  
 * Description:
 *    This is the main script for Project USB
 *    
 *    This listens to the events on the touch panel for USB use and will alter the systems configuration to work with a 3rd party USB AV Bridge
 * 
 *    The default configuration is stored using 'projUSB_FirstTimeSetup_1-1-0' and 'memStoreV2'
 * 
 * Dependencies: 
 *    'memStoreV2':
 *        Memblock Indexes 0 - 12 are in use for 'projUSB_Main_1-1-0' and proj and 'USB_FirstTimeSetup_1-1-0'
********************************************************/

import { stored_Information, lastStore, memBlock, getMemInformation, memChain, memoryCapacity, updateMemBlock, sleep } from './memStoreV2';

function defaultConfig() {
  xapi.config.set('Video Monitors', memBlock[1].value);
  xapi.config.set('Video Output Connector 1 MonitorRole', memBlock[2].value);
  xapi.config.set('Video Output Connector 2 MonitorRole', memBlock[3].value);
  xapi.config.set('Audio Microphones AGC', memBlock[8].value).catch(e => {
    console.warn('Error Exception Handled for AGC');
    console.error(e);
  });
  xapi.config.set('Audio Output Line 1 Mode', memBlock[9].value);
  xapi.config.set('Audio Output Line 1 OutputType', memBlock[10].value);
  xapi.command('Conference DoNotDisturb Deactivate');
  xapi.command('Audio VuMeter Stop', {
    ConnectorId: 2,
    ConnectorType: 'Microphone'
  }).catch(e => {
    console.warn('Error Exception Handled for VuMEter');
    console.error(e);
  });
  xapi.command('Video Selfview Set', {
    Mode: memBlock[7].value,
    FullscreenMode: memBlock[4].value,
    OnMonitorRole: memBlock[5].value,
    PIPPosition: memBlock[6].value
  })
}

function usbModeConfig() {
  xapi.config.set('Video Monitors', 'Dual');
  xapi.config.set('Video Output Connector 1 MonitorRole', 'First');
  xapi.config.set('Video Output Connector 2 MonitorRole', 'Second');
  xapi.config.set('Audio Microphones AGC', 'Off').catch(e => {
    console.warn('Error Exception Handled for AGC');
    console.error(e);
  });
  xapi.command('Audio VuMeter Start', {
    ConnectorId: 2,
    ConnectorType: 'Microphone'
  }).catch(e => {
    console.warn('Error Exception Handled for VuMeter');
    console.error(e);
  });
  xapi.config.set('Audio Output Line 1 Mode', 'On')
  xapi.config.set('Audio Output Line 1 OutputType', 'Microphone')
  xapi.command('Presentation Start')
  xapi.command('Conference DoNotDisturb Activate', {
    Timeout: 1440
  })
  sleep(500).then(() => {
  xapi.command('Video Selfview Set', {
    Mode: 'On',
    FullscreenMode: 'On',
    OnMonitorRole: 'Second',
  })
  })
}

function init() {
  getMemInformation()
  sleep(500).then(() => {
    if (memBlock[0].value === 'Complete') {
      console.log('FirstTimeSetup has been completed. USB mode ready')
    } else {
      console.log('Wizard has not seen battle, please enable the script "proj_USB_FirstTimeSetup_v2"')
    }
  });
}

sleep(125).then(() => {
  init()
});

getMemInformation()

xapi.status.on('Standby State', (event) => {
  if (event === 'Standby') {
    console.log('Entering Standby, disabling USB Mode.')
    defaultConfig();
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
  } else {

  }
})

xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
  switch (event.PanelId) {
    case 'proUSB_Inactive_1-0-0':
      console.log('USB Mode Enabled, reconfigurring endpoint...')
      usbModeConfig();
      updateMemBlock('Enabled', 11)
      xapi.command('UserInterface Extensions Panel Update', {
        PanelId: 'proUSB_Inactive_1-0-0',
        Visibility: 'Hidden'
      })
      xapi.config.set('UserInterface Features HideAll', 'True')
      xapi.command('UserInterface Extensions Panel Update', {
        PanelId: 'proUSB_Active_1-0-0',
        Visibility: 'Auto'
      })
      console.log('USB Mode configuration complete!')
      break;
    case 'proUSB_Active_1-0-0':
      console.log('USB Mode Disabled, restoring endpoint configuration...')
      defaultConfig();
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
      console.log('Default configuration restoration complete!')
      break;
    default:
      break;
  }
})