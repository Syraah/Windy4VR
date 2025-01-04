import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-windy4vr',
    version: '1.0.8',
    title: 'Windy4VR',
    icon: '🥕',
    description: 'Plugin windy pour visualiser son routage virtuel',
    author: 'Syraah',
    repository: 'https://github.com/Syraah/Windy4VR',
    desktopUI: 'rhpane',
	mobileUI: 'small',
	desktopWidth: 400,
    routerPath: '/windy4vr',
};

export default config;