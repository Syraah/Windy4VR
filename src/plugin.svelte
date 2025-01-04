<script lang="ts">
// Windy Plugin - GPX Viewer
import { map } from '@windy/map';
import store from '@windy/store';
import { onMount, onDestroy } from 'svelte';
import { wind2obj } from '@windy/utils';
import { getLatLonInterpolator } from '@windy/interpolator';
import metrics from '@windy/metrics';
import broadcast from '@windy/broadcast';
//import { zonesInterdites } from './exclusionsVG24';


let routes = [];
let routesWP = [];
let gpsData; // Parsed GPX data
let gpxFile = null; // Contiendra le fichier GPX
let closestWaypoints = []; // Stockera les coordonnées extraites
let gpxContent = ""; // Contenu du fichier GPX chargé
let markers = [];
let isLoading = false; // Indicateur de chargement
let current_time = new Date(store.get("timestamp")).toLocaleString();
let fileSelected = false;
let polylines = [];
let windDatas = [];
let windSpeed = null;
let windDir = null;
let format = null;
let filesList = [];
let filesNumbers = 0;
let colors = [];
let ZE = [];
let CSVformat = "";
let isShowZE = false;
let hue = 0;

const normal_icon = `<svg  viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;"><path d="M4.784,13.635c0,0 -0.106,-2.924 0.006,-4.379c0.115,-1.502 0.318,-3.151 0.686,-4.632c0.163,-0.654 0.45,-1.623 0.755,-2.44c0.202,-0.54 0.407,-1.021 0.554,-1.352c0.038,-0.085 0.122,-0.139 0.215,-0.139c0.092,0 0.176,0.054 0.214,0.139c0.151,0.342 0.361,0.835 0.555,1.352c0.305,0.817 0.592,1.786 0.755,2.44c0.368,1.481 0.571,3.13 0.686,4.632c0.112,1.455 0.006,4.379 0.006,4.379l-4.432,0Z" style="fill:#000;"/><path d="M5.481,12.731c0,0 -0.073,-3.048 0.003,-4.22c0.06,-0.909 0.886,-3.522 1.293,-4.764c0.03,-0.098 0.121,-0.165 0.223,-0.165c0.103,0 0.193,0.067 0.224,0.164c0.406,1.243 1.232,3.856 1.292,4.765c0.076,1.172 0.003,4.22 0.003,4.22l-3.038,0Z" style="fill:#fff;fill-opacity:0.846008;"/></svg>`;

const carrot_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-23.6626 -11.6643 10.13 31.78" width="12px" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;">
	<path d="M -13.6675 17.5876 C -13.5859 17.5005 -13.5395 17.386 -13.5377 17.2667 C -13.5377 17.2667 -13.5272 16.724 -13.5656 16.0588 C -13.6038 15.3939 -13.673 14.6183 -13.9117 14.0237 C -14.3916 12.828 -15.0129 12.1904 -16.2213 10.9823 L -16.3619 10.8417 C -16.0511 10.7066 -15.7589 10.5416 -15.5067 10.3259 C -14.886 9.7949 -14.4958 8.9926 -14.5561 8.0627 C -14.7854 4.5287 -15.0472 -0.203 -15.6672 -3.3076 C -16.1591 -5.7715 -17.1428 -10.6992 -17.1428 -10.6992 C -17.2542 -11.2578 -17.7505 -11.6645 -18.3201 -11.6643 H -18.5402 C -19.0775 -11.6642 -19.5537 -11.303 -19.6977 -10.7853 C -19.6977 -10.7853 -20.5206 -7.8271 -20.932 -6.3478 C -22.2827 -1.4909 -22.9811 3.2939 -22.9831 8.7733 C -22.9835 9.7617 -22.2964 10.4539 -21.5352 10.8124 C -21.2793 10.9325 -21.0113 11.0166 -20.7424 11.0855 L -20.9784 11.3215 C -22.1992 12.5423 -22.5107 13.0302 -22.9419 14.0089 C -23.2162 14.6316 -23.378 15.489 -23.4921 16.2218 S -23.6605 17.5543 -23.6605 17.5543 C -23.685 17.8183 -23.4908 18.0521 -23.2268 18.0765 C -23.0843 18.0898 -22.9434 18.0388 -22.8424 17.9374 L -20.3365 15.4316 L -18.8861 19.7856 C -18.8024 20.0372 -18.5307 20.1733 -18.2792 20.0896 C -18.123 20.0377 -18.0042 19.9094 -17.9646 19.7497 L -16.8125 15.1425 L -14.3571 17.5979 C -14.1697 17.7855 -13.8657 17.7856 -13.6782 17.5982 C -13.6746 17.5946 -13.671 17.591 -13.6676 17.5872 L -13.6675 17.5875 Z" fill="#000"/>
	<path d="M -16.1217 9.6048 C -16.5451 9.967 -17.177 10.1998 -17.8745 10.2332 L -19.2508 10.2994 C -19.7879 10.3246 -20.55 10.2189 -21.1136 9.9534 C -21.6784 9.6873 -22.01 9.3516 -22.0098 8.7813 C -22.0096 8.1371 -21.9988 7.504 -21.9794 6.8788 L -18.7655 6.8788 C -18.6357 6.8802 -18.511 6.829 -18.4195 6.7369 C -18.2328 6.5486 -18.234 6.2447 -18.4221 6.058 C -18.5133 5.9674 -18.637 5.9173 -18.7656 5.9187 L -21.9342 5.9188 C -21.8203 3.5442 -21.5678 1.2848 -21.172 -0.9291 C -21.1618 -0.9284 -21.1517 -0.9284 -21.1415 -0.9284 L -19.1051 -0.9284 C -18.9753 -0.9269 -18.8505 -0.9781 -18.759 -1.0703 C -18.5724 -1.2585 -18.5736 -1.5625 -18.7618 -1.7492 C -18.853 -1.8396 -18.9766 -1.8897 -19.105 -1.8884 L -20.9878 -1.8883 C -20.7102 -3.2906 -20.3837 -4.6829 -19.9947 -6.0819 C -19.5832 -7.5614 -18.7591 -10.5207 -18.7591 -10.5207 C -18.7297 -10.6276 -18.6374 -10.6968 -18.527 -10.6971 H -18.307 C -18.1888 -10.6971 -18.0934 -10.6197 -18.0711 -10.5034 C -18.0711 -10.5034 -17.5648 -7.9675 -17.1642 -5.9611 L -18.4264 -5.9611 C -18.6915 -5.9658 -18.9102 -5.7548 -18.9149 -5.4897 S -18.7086 -5.0059 -18.4435 -5.0011 C -18.4378 -5.001 -18.4322 -5.001 -18.4264 -5.0011 H -17.0688 C -17.0373 -5.0012 -17.006 -5.0044 -16.9751 -5.0106 C -16.8088 -4.1779 -16.7222 -3.7449 -16.5958 -3.112 C -16.3051 -1.6557 -16.0927 0.2287 -15.9237 2.1847 L -18.4268 2.1846 C -18.6919 2.1799 -18.9106 2.391 -18.9153 2.6561 S -18.709 3.1399 -18.4439 3.1446 C -18.4382 3.1448 -18.4325 3.1448 -18.4268 3.1446 L -15.8521 3.1446 C -15.7169 4.8625 -15.6002 6.6192 -15.5021 8.1324 C -15.4602 8.7772 -15.6955 9.2433 -16.1186 9.6055 L -16.1217 9.6048 Z" fill="#FF6A00"/>
	<path d="M -14.5307 16.0663 L -16.7329 13.8641 C -16.9963 13.6008 -17.4461 13.7246 -17.5377 14.0855 L -18.4963 17.9185 L -19.6724 14.3905 C -19.7857 14.053 -20.2144 13.952 -20.4665 14.2036 L -22.5136 16.2506 C -22.4034 15.5786 -22.2434 14.8026 -22.0641 14.3957 C -21.6483 13.4515 -21.4939 13.1944 -20.2995 11.9999 L -19.5479 11.2482 C -18.8589 11.2623 -18.0949 11.1913 -17.4239 11.1369 C -17.2503 11.3105 -17.0742 11.4865 -16.8999 11.6608 C -15.6929 12.8676 -15.2253 13.3354 -14.8025 14.3815 C -14.6634 14.7278 -14.569 15.4528 -14.5307 16.0666 L -14.5308 16.0663 Z" fill="#0F0"/>
</svg>`;


  

let currentIcon = normal_icon;
let isNormalIcon = true;

const zonesInterdites = [
	[//capFinisterre: [
		{ lat: 43.523333, lng: -10.086667 }, // 43°31,400 N  010°05,200 W
		{ lat: 43.35, lng: -9.606667 },     // 43°21,000 N  009°36,400 W
		{ lat: 43.175, lng: -9.733333 },    // 43°10,500 N  009°44,000 W
		{ lat: 42.88, lng: -9.733333 },     // 42°52,800 N  009°44,000 W
		{ lat: 42.88, lng: -10.230833 },    // 42°52,800 N  010°13,850 W
		{ lat: 43.315833, lng: -10.230833 } // 43°18,950 N  010°13,850 W
	],
	[//capRoca: [
		{ lat: 38.866667, lng: -9.685 },    // 38°52,000 N  009°41,100 W
		{ lat: 38.661667, lng: -9.666667 }, // 38°39,700 N  009°40,000 W
		{ lat: 38.565, lng: -10.195 },      // 38°33,900 N  010°11,700 W
		{ lat: 38.681667, lng: -10.23 },    // 38°40,900 N  010°13,800 W
		{ lat: 38.866667, lng: -10.23 }     // 38°52,000 N  010°13,800 W
	],
	[//capStVincent: [
		{ lat: 37.041667, lng: -9.195 },    // 37°02,500 N  009°11,700 W
		{ lat: 36.945, lng: -9.171667 },    // 36°56,700 N  009°10,300 W
		{ lat: 36.858333, lng: -9.071667 }, // 36°51,500 N  009°04,300 W
		{ lat: 36.835, lng: -8.953333 },    // 36°50,100 N  008°57,200 W
		{ lat: 36.42, lng: -9.1 },          // 36°25,200 N  009°06,000 W
		{ lat: 36.474333, lng: -9.36 },     // 36°28,460 N  009°21,600 W
		{ lat: 36.736667, lng: -9.664583 }, // 36°44,200 N  009°39,850 W
		{ lat: 36.943333, lng: -9.721667 }  // 36°56,600 N  009°43,300 W
	],
	[//canariesEst: [
		{ lat: 28.33, lng: -14.795 },    // 28°19,800 N  014°47,700 W
		{ lat: 27.813, lng: -15.005833 },// 27°48,780 N  015°00,350 W
		{ lat: 27.858333, lng: -15.1475 },// 27°51,500 N  015°08,850 W
		{ lat: 28.341667, lng: -14.951667 } // 28°20,500 N  014°57,100 W
	],
	[//canariesOuest: [
		{ lat: 28.563333, lng: -15.655 },    // 28°33,800 N  015°39,300 W
		{ lat: 27.973333, lng: -16.215833 }, // 27°58,400 N  016°12,950 W
		{ lat: 28.0575, lng: -16.3275 },     // 28°03,450 N  016°19,650 W
		{ lat: 28.635, lng: -15.78 }         // 28°38,100 N  015°46,800 W
	],
	[//mauritanie: [
		{ lat: 21.516667, lng: -16.416667 }, // 21°31,000 N  016°25,000 W
		{ lat: 16.0, lng: -16.416667 },      // 16°00,000 N  016°25,000 W
		{ lat: 16.0, lng: -17.583333 },      // 16°00,000 N  017°35,000 W
		{ lat: 21.516667, lng: -17.583333 }  // 21°31,000 N  017°35,000 W
	],
	[//caboFrio: [
		{ lat: -21.5, lng: -39.75 },         // 21°30,000 S  039°45,000 W
		{ lat: -21.933333, lng: -39.233333 },// 21°56,000 S  039°14,000 W
		{ lat: -23.0, lng: -40.220833 },     // 23°00,000 S  040°13,250 W
		{ lat: -23.5775, lng: -41.015 },     // 23°34,650 S  041°00,900 W
		{ lat: -23.483333, lng: -41.633333 },// 23°29,000 S  041°38,000 W
		{ lat: -22.133333, lng: -40.416667 } // 22°08,000 S  040°25,000 W
	],
	[//rioDeJaneiro: [
		{ lat: -24.9, lng: -42.85 },       // 24°54,000 S  042°51,000 W
		{ lat: -25.5, lng: -42.263333 },  // 25°30,000 S  042°15,800 W
		{ lat: -25.916667, lng: -43.333333 }, // 25°55,000 S  043°20,000 W
		{ lat: -25.505833, lng: -43.75 }   // 25°30,350 S  043°45,000 W
	],
	[//zpbAcores: [
		{ lat: 40.9, lng: -28.566667 },   // 40°54.000 N  028°34.000 W
		{ lat: 37.81, lng: -23.833333 }, // 37°48.600 N  023°50.000 W
		{ lat: 36.626667, lng: -24.216667 }, // 36°37.600 N  024°13.000 W
		{ lat: 36.34, lng: -25.593333 }, // 36°20.400 N  025°35.600 W
		{ lat: 37.583333, lng: -31.856667 }, // 37°35.000 N  031°51.400 W
		{ lat: 40.0, lng: -31.833333 }   // 40°00.000 N  031°50.000 W
	],
	[//zpbCapVert: [
		{ lat: 17.75, lng: -25.35 },     // 17°45.000 N  025°21.000 W
		{ lat: 17.7, lng: -22.666667 }, // 17°42.000 N  022°40.000 W
		{ lat: 15.966667, lng: -22.133333 }, // 15°58.000 N  022°08.000 W
		{ lat: 14.533333, lng: -22.833333 }, // 14°32.000 N  022°50.000 W
		{ lat: 14.666667, lng: -25.416667 }, // 14°40.000 N  025°25.000 W
		{ lat: 16.166667, lng: -26.133333 }  // 16°10.000 N  026°08.000 W
	],
	[//southScilly: [
		{ lat: 49.7675, lng: -6.275833 },   // 49°46,050 N  006°16,550 W
		{ lat: 49.592333, lng: -6.273333 }, // 49°35,540 N  006°16,400 W
		{ lat: 49.5925, lng: -6.568333 },   // 49°35,550 N  006°34,100 W
		{ lat: 49.767167, lng: -6.4925 }    // 49°46,030 N  006°29,550 W
	],
	[//ouessant: [
		{ lat: 49.034167, lng: -5.611667 },  // TSS Ouessant A : 49°02,050 N  005°36,700 W
		{ lat: 48.81, lng: -5.416667 },      // TSS Ouessant B : 48°48,600 N  005°25,000 W
		{ lat: 48.62, lng: -5.1975 },        // TSS Ouessant C : 48°37,200 N  005°11,850 W
		{ lat: 48.489167, lng: -5.3675 },    // TSS Ouessant D : 48°29,350 N  005°22,050 W
		{ lat: 48.583333, lng: -5.708333 },  // TSS Ouessant E : 48°35,000 N  005°42,500 W
		{ lat: 48.708333, lng: -6.051667 },  // TSS Ouessant F : 48°42,500 N  006°03,100 W
		{ lat: 48.94, lng: -5.86 }           // TSS Ouessant G : 48°56,400 N  005°51,600 W
	],
	[//eoliennesIleYeu: [
		{ lat: 46.952167, lng: -2.526667 }, // ZI Eoliennes Yeu A : 46°57,130 N  002°31,600 W
		{ lat: 46.848583, lng: -2.404333 }, // ZI Eoliennes Yeu B : 46°50,915 N  002°24,260 W
		{ lat: 46.800417, lng: -2.491083 }, // ZI Eoliennes Yeu C : 46°48,025 N  002°29,465 W
		{ lat: 46.884583, lng: -2.590583 }, // ZI Eoliennes Yeu D : 46°53,075 N  002°35,435 W
		{ lat: 46.916083, lng: -2.59175 }   // ZI Eoliennes Yeu E : 46°54,965 N  002°35,505 W
	],
	[//zea: [
		{ lat: -44.0, lng: 0.0 },       // 44°00.00'S 000°00.00'E
		{ lat: -44.25, lng: 5.0 },     // 44°15.00'S 005°00.00'E
		{ lat: -44.8333, lng: 10.0 },  // 44°50.00'S 010°00.00'E
		{ lat: -45.4167, lng: 15.0 },  // 45°25.00'S 015°00.00'E
		{ lat: -46.0, lng: 20.0 },     // 46°00.00'S 020°00.00'E
		{ lat: -46.75, lng: 25.0 },    // 46°45.00'S 025°00.00'E
		{ lat: -47.5, lng: 30.0 },     // 47°30.00'S 030°00.00'E
		{ lat: -47.75, lng: 35.0 },    // 47°45.00'S 035°00.00'E
		{ lat: -48.0, lng: 40.0 },     // 48°00.00'S 040°00.00'E
		{ lat: -48.75, lng: 45.0 },    // 48°45.00'S 045°00.00'E
		{ lat: -49.3333, lng: 50.0 },  // 49°20.00'S 050°00.00'E
		{ lat: -49.8333, lng: 55.0 },  // 49°50.00'S 055°00.00'E
		{ lat: -50.25, lng: 60.0 },    // 50°15.00'S 060°00.00'E
		{ lat: -50.5833, lng: 65.0 },  // 50°35.00'S 065°00.00'E
		{ lat: -50.9167, lng: 70.0 },  // 50°55.00'S 070°00.00'E
		{ lat: -50.9167, lng: 75.0 },  // 50°55.00'S 075°00.00'E
		{ lat: -50.6667, lng: 80.0 },  // 50°40.00'S 080°00.00'E
		{ lat: -50.4167, lng: 85.0 },  // 50°25.00'S 085°00.00'E
		{ lat: -50.0, lng: 90.0 },     // 50°00.00'S 090°00.00'E
		{ lat: -49.0, lng: 95.0 },     // 49°00.00'S 095°00.00'E
		{ lat: -46.0, lng: 100.0 },    // 46°00.00'S 100°00.00'E
		{ lat: -46.0, lng: 105.0 },    // 46°00.00'S 105°00.00'E
		{ lat: -46.0, lng: 110.0 },    // 46°00.00'S 110°00.00'E
		{ lat: -46.0, lng: 115.0 },    // 46°00.00'S 115°00.00'E
		{ lat: -49.0, lng: 120.0 },    // 49°00.00'S 120°00.00'E
		{ lat: -49.75, lng: 125.0 },   // 49°45.00'S 125°00.00'E
		{ lat: -50.0, lng: 130.0 },    // 50°00.00'S 130°00.00'E
		{ lat: -50.0, lng: 135.0 },    // 50°00.00'S 135°00.00'E
		{ lat: -50.0, lng: 140.0 },    // 50°00.00'S 140°00.00'E
		{ lat: -50.0, lng: 145.0 },    // 50°00.00'S 145°00.00'E
		{ lat: -50.0, lng: 150.0 },    // 50°00.00'S 150°00.00'E
		{ lat: -56.0833, lng: 155.0 }, // 56°05.00'S 155°00.00'E
		{ lat: -56.3333, lng: 160.0 }, // 56°20.00'S 160°00.00'E
		{ lat: -56.5, lng: 165.0 },    // 56°30.00'S 165°00.00'E
		{ lat: -56.6667, lng: 170.0 }, // 56°40.00'S 170°00.00'E
		{ lat: -57.3333, lng: 175.0 }, // 57°20.00'S 175°00.00'E
		{ lat: -58.0, lng: 180.0 },     // 58°00.00'S 180°00.00'E
		{ lat: -80.0, lng: 180.0 },     // 58°00.00'S 180°00.00'E
		{ lat: -80, lng: -175.0 },   // 58°15.00'S 175°00.00'W
		{ lat: -58.25, lng: -175.0 },   // 58°15.00'S 175°00.00'W
		{ lat: -58.25, lng: -170.0 },   // 58°15.00'S 170°00.00'W
		{ lat: -58.0, lng: -165.0 },    // 58°00.00'S 165°00.00'W
		{ lat: -57.25, lng: -160.0 },   // 57°15.00'S 160°00.00'W
		{ lat: -56.5, lng: -155.0 },    // 56°30.00'S 155°00.00'W
		{ lat: -55.75, lng: -150.0 },   // 55°45.00'S 150°00.00'W
		{ lat: -55.0, lng: -145.0 },    // 55°00.00'S 145°00.00'W
		{ lat: -54.25, lng: -140.0 },   // 54°15.00'S 140°00.00'W
		{ lat: -54.0, lng: -135.0 },    // 54°00.00'S 135°00.00'W
		{ lat: -54.25, lng: -130.0 },   // 54°15.00'S 130°00.00'W
		{ lat: -54.75, lng: -125.0 },   // 54°45.00'S 125°00.00'W
		{ lat: -55.25, lng: -120.0 },   // 55°15.00'S 120°00.00'W
		{ lat: -55.75, lng: -115.0 },   // 55°45.00'S 115°00.00'W
		{ lat: -57.5, lng: -110.0 },    // 57°30.00'S 110°00.00'W
		{ lat: -58.25, lng: -105.0 },   // 58°15.00'S 105°00.00'W
		{ lat: -58.8333, lng: -100.0 }, // 58°50.00'S 100°00.00'W
		{ lat: -59.1667, lng: -95.0 },  // 59°10.00'S 095°00.00'W
		{ lat: -59.5, lng: -90.0 },     // 59°30.00'S 090°00.00'W
		{ lat: -59.6667, lng: -85.0 },  // 59°40.00'S 085°00.00'W
		{ lat: -59.5, lng: -80.0 },     // 59°30.00'S 080°00.00'W
		{ lat: -59.25, lng: -75.0 },    // 59°15.00'S 075°00.00'W
		{ lat: -58.75, lng: -70.0 },    // 58°45.00'S 070°00.00'W
		{ lat: -58.0, lng: -65.0 },     // 58°00.00'S 065°00.00'W
		{ lat: -56.5, lng: -60.0 },     // 56°30.00'S 060°00.00'W
		{ lat: -54.0, lng: -55.0 },     // 54°00.00'S 055°00.00'W
		{ lat: -45.0, lng: -50.0 },     // 45°00.00'S 050°00.00'W
		{ lat: -44.0, lng: -45.0 },     // 44°00.00'S 045°00.00'W
		{ lat: -44.0, lng: -40.0 },     // 44°00.00'S 040°00.00'W
		{ lat: -44.0, lng: -35.0 },     // 44°00.00'S 035°00.00'W
		{ lat: -43.5, lng: -30.0 },     // 43°30.00'S 030°00.00'W
		{ lat: -43.0, lng: -25.0 },     // 43°00.00'S 025°00.00'W
		{ lat: -43.0, lng: -20.0 },     // 43°00.00'S 020°00.00'W
		{ lat: -43.0, lng: -15.0 },     // 43°00.00'S 015°00.00'W
		{ lat: -43.0, lng: -10.0 },     // 43°00.00'S 010°00.00'W
		{ lat: -43.5, lng: -5.0 },		// 43°30.00'S 005°00.00'W
	]
];

// Fonction principale pour le plugin
function initPlugin() {
    // Vérifier que la variable "store" de Windy est disponible
    if (typeof store === 'undefined') {
        console.error("Windy store is not available.");
        return;
    }
	
    // Stocker la valeur initiale de store.timestamp et store.product
    let previousTimestamp = store.get("timestamp");
	let previousProduct = store.get("product");

    // Observer les changements de store.timestamp
    store.on("timestamp", (newTimestamp) => {
		const date = new Date(newTimestamp);
        if (newTimestamp !== previousTimestamp ) {
            previousTimestamp = newTimestamp; // Mettre à jour la valeur précédente
            syncMarkerWithForecast(date); // Appeler une fonction pour gérer le changement
			fetchWindData()
		}
    });
	
	// Observer les changements de store.product
    store.on("product", (newProduct) => {
            fetchWindData();
    });
    console.log("Plugin initialized and listening for timestamp changes.");
}

//fonction pour récupérer les fichiers sélectionnés
async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
	fileSelected = true;
	filesNumbers = files.length;
	
	
	for (const file of files) {
		if (filesList.indexOf(file.name) == -1) {
		  try {
			const fileExtension = file.name.split('.').pop().toLowerCase();
			hue = (hue + 60) % 360;
			const color = `hsl(${hue}, 100%, 45%)`;
			var waypoints = [];
			// Vérifier le type de fichier et appeler la fonction appropriée
				if (fileExtension === 'csv') {
					const content = await readCSV(file);
					waypoints = await parseCSV(content);
				} else if (fileExtension === 'gpx') {
					const content = await readGPX(file);
					waypoints = parseGpx(content);
				} else {
					console.error('Unsupported file type:', file.name);
					alert('Type de fichier non pris en charge. Veuillez charger un fichier .csv ou .gpx.');
				}
		
			// Ajouter la nouvelle route et réassigner `routes`
			routes = [
			  ...routes,
			  {
				fileName: file.name,
				waypoints,
				ploted: false,
				color
			  },
			];
		  filesList.push(file.name);
		  } catch (err) {
			console.error('Error reading file:', err);
		  }
		} else {
            alert(`Le fichier "${file.name}" est déjà présent.`);
        }
    }
	plotGpsData();
	const date = new Date(store.get("timestamp"));
	syncMarkerWithForecast(date);
  }
 
 // Fonction pour lire un fichier gpx et retourner son contenu
  function readGPX(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);

      reader.readAsText(file);
    });
  }

 // Fonction pour lire un fichier csv et retourner son contenu  
  function readCSV(file) {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const rows = text.split('\n').map(row => row.trim());
            
            // Supprimer les lignes vides
            const nonEmptyRows = rows.filter(row => row.length > 0);

            const headers = nonEmptyRows[0].split(';');
            const data = nonEmptyRows.slice(1).map((row) => {
                const values = row.split(';');
                return headers.reduce((acc, header, index) => {
                    acc[header] = values[index];
                    return acc;
                }, {});
            });
			CSVformat = detectFormatCSV(headers);
            
            resolve(data); // Résoudre la promesse avec les données parsées
        };
        reader.onerror = (err) => reject(err); // Rejeter la promesse en cas d'erreur
        reader.readAsText(file);
    });
}

// Fonction pour convertir DMS (XX°YY.ZZZ D) en degrés décimaux
function dmsToDecimal(coord) {
    // Expression régulière pour extraire les degrés, minutes et la direction
    const regex = /(\d+)[^\d]+([\d.]+)\s*([NSEW])/i;
    const match = coord.match(regex);

    if (!match) {
        throw new Error(`Coordonnée invalide : ${coord}`);
    }

    const degrees = parseFloat(match[1]);
    const minutes = parseFloat(match[2]);
    const direction = match[3].toUpperCase();

    let decimal = degrees + minutes / 60;

    // Appliquer le signe négatif si direction est S ou W
    if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
    }
    return decimal;
}

function completeDateWithYearTransition(dateString, currentYear) {
    // Séparer les composants jour, mois et heure
    const [day, monthAndTime] = dateString.split('/');
    const [month, time] = monthAndTime.split(' ');

    // Construire la date avec l'année courante
    return new Date(`${currentYear}-${month}-${day}T${time}`);
}

// Fonction principale pour traiter les données du CSV
function parseCSV(data) {
	var parsedData = [];
	if (CSVformat == "Avalon") {
		let currentYear = new Date().getFullYear(); // Année courante
		let previousDate = null;
		parsedData = data.map((row) => {
			const rawDate = row['Date']; // Par exemple, "31/12 23:47" ou "01/01 00:07"
			let parsedDate = completeDateWithYearTransition(rawDate, currentYear);
			
			// Vérifier si l'année doit être incrémentée
			if (previousDate && parsedDate < previousDate) {
				// Passage à l'année suivante
				currentYear++;
				parsedDate = completeDateWithYearTransition(rawDate, currentYear);
			}
			previousDate = parsedDate;
			return {
				time: parsedDate,
				lat: parseFloat(row['Latitude']),
				lon: parseFloat(row['Longitude']),
				COG: parseFloat(row['Heading']),
				SOG: parseFloat(row['Speed']),
				SAIL: row['SailSet'],
				TWA: parseFloat(row['TWA']),
				TWD: parseFloat(row['TWD']),
				TWS: parseFloat(row['TWS'])
			}
			});
	} else if (CSVformat == "Dorado") {
		parsedData = data.map((row) => {
			const [lat, lon] = row.position.split('  ').map((coord) => dmsToDecimal(coord.trim()));
			return {
				lat,
				lon,
				time: new Date(row.time),
				SOG: parseFloat(row.sog),
				TWS: parseFloat(row.TWS),
				TWD: parseFloat(row.TWD),
				SOG: parseFloat(row['current speed']),
				COG: parseFloat(row['current dir.']),
			};
		});
	}
	// calcul du COG si non présent dans CSV
	for (let i = 0; i < parsedData.length-1; i++) {
			var WP = parsedData[i];
			if (WP.COG == 0) {
				var nextWP = parsedData[i+1];
				var COG = calculateBearing(WP.lat, WP.lon, nextWP.lat, nextWP.lon);
				parsedData[i].COG = COG;
			}
		}
		parsedData[parsedData.length-1].COG = parsedData[parsedData.length-2].COG;

    // Retourner les données pour une utilisation ultérieure
    return parsedData;
}

// Parse GPX Content
function parseGpx(gpxString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxString, "application/xml");
	

    // Récupérer toutes les balises <wpt>
    const wptNodes = xmlDoc.querySelectorAll("wpt");
	// Récupérer toutes les balises <rtept>
    const rteptNodes = xmlDoc.querySelectorAll("rtept");
	
	
	if (wptNodes.length == 0) {
		// Tableau pour stocker les données extraites
		const rteptData = [];
		// Parcourir chaque balise <wpt>
		rteptNodes.forEach((rtept) => {
			const lat = parseFloat(rtept.getAttribute("lat"));
			const lon = parseFloat(rtept.getAttribute('lon')) > 0 ? (parseFloat(rtept.getAttribute('lon')) % 360) - 360 : parseFloat(rtept.getAttribute('lon'))
			const timeString = rtept.querySelector("time")?.textContent || null;
			const time = timeString ? new Date(timeString) : null; // Convertir le temps
			const name = rtept.querySelector("name")?.textContent || "Unknown";
			
			// Ajouter les données au tableau
			rteptData.push({
				lat, // Latitude
				lon, // Longitude
				time, // Heure
				name, // Nom
			});
		});
		for (let i = 0; i < rteptData.length-1; i++) {
			var WP = rteptData[i];
			var nextWP = rteptData[i+1];
			var COG = calculateBearing(WP.lat, WP.lon, nextWP.lat, nextWP.lon);
			rteptData[i].COG = COG;	
		}
		rteptData[rteptData.length-1].COG = rteptData[rteptData.length-2].COG;
		return rteptData;				
	} else {
	const desc = xmlDoc.querySelector('desc')?.textContent;
    if (!desc) return { error: 'No desc tag found' };
    const descFormat = detectFormatGPX(desc);
	// Tableau pour stocker les données extraites
    const wptData = [];

    // Parcourir chaque balise <wpt>
    wptNodes.forEach((wpt) => {
        const lat = parseFloat(wpt.getAttribute("lat"));
        const lon = parseFloat(wpt.getAttribute('lon')) > 0 ? (parseFloat(wpt.getAttribute('lon')) % 360) - 360 : parseFloat(wpt.getAttribute('lon'))
        const ele = parseFloat(wpt.querySelector("ele")?.textContent || "0");
        const timeString = wpt.querySelector("time")?.textContent || null;
		const time = timeString ? new Date(timeString) : null; // Convertir le temps
        const name = wpt.querySelector("name")?.textContent || "Unknown";
        const desc = wpt.querySelector("desc")?.textContent || "";

        // Extraire les valeurs de la balise <desc>
        const match = desc.match(format);

        // Ajouter les données au tableau
		if (descFormat == 1){
			wptData.push({
				lat, // Latitude
				lon, // Longitude
				ele, // Élévation
				time, // Heure
				name, // Nom
				COG: match ? parseFloat(match[1].replace(",", ".")) : null, // Cap
				SOG: match ? parseFloat(match[2].replace(",", ".")) : null, // Vitesse sol
				TWS: match ? parseFloat(match[3].replace(",", ".")) : null, // Vitesse du vent
				TWA: match ? parseFloat(match[4].replace(",", ".")) : null, // Angle du vent
				SAIL: match ? match[5] : null, // Type de voile
			});
		} else if (descFormat == 2 && match != null) {
			wptData.push({
            lat, // Latitude
            lon, // Longitude
            ele, // Élévation
            time, // Heure
            name, // Nom
            COG: match[1], // Cap
            SOG: match[4], // Vitesse sol
            TWS: match[5], // Vitesse du vent
            TWA: match[2], // Angle du vent
            SAIL: match[3], // Type de voile
        });
		}
    });
	// calcul du COG si non présent dans le GPX
	for (let i = 0; i < wptData.length-1; i++) {
			var WP = wptData[i];
			if (WP.COG == 0) {
				var nextWP = wptData[i+1];
				var COG = calculateBearing(WP.lat, WP.lon, nextWP.lat, nextWP.lon);
				wptData[i].COG = COG;
				console.log(COG);
			}
		}
		wptData[wptData.length-1].COG = wptData[wptData.length-2].COG;
	return wptData;
	}
}

//fonction pour afficher les zones d'exclusion 
function showZE() {
	Object.entries(zonesInterdites).forEach(([zoneName, coordinates]) => {
		var polygon = L.polygon(coordinates, {color: 'red'}).addTo(map);
		ZE.push(polygon);
	});
}

//fonction pour masquer les zones d'exclusion
function hideZE() {
	ZE.forEach ((zone) => {
		map.removeLayer(zone);
	});
}

function calculateTWA(wind, boatHeading) {
    // Calcul de la TWA absolue
    let TWA = (wind - boatHeading + 360) % 360;

    // Normalisation dans [-180, 180]
    if (TWA > 180) {
        TWA -= 360; // Si > 180, le vent est sur bâbord
    }

    return Math.round(TWA);
}


// Détection du format du fichier
function detectFormatCSV(headers) {
    if (headers.includes('Date') && headers.includes('Latitude') && headers.includes('Longitude')) {
        return 'Avalon';
    }
    if (headers.includes('position') && headers.includes('time') && headers.includes('sog')) {
        return 'Dorado';
    }
    return 'Unknown';
}

function detectFormatGPX(desc) {
	const format1 = /COG = ([\d,.]+).+ SOG = ([\d,.]+)nds TWS = ([\d,.]+)nds TWA = ([\d.,]+).+ SAIL = ([\w-]*)/;
	const format2 = /HDG:(\d+)\s+TWA:([-\d.,]+)\s+(.+?)\s+SOG:([\d.,]+)\s+kt\s+TWS:([\d.,]+)\s+kt/;
    if (format1.test(desc)) {
	  format = format1;
	  return 1;
    } else if (format2.test(desc)) {
      format = format2;
	  return 2;
    } else {
      console.error("format de fichier incompatible");
	  return 0;
    }
  }

  // Fonction pour trouver le point le plus proche de l'heure sélectionnée
  function findClosestMarkerWithForecast(forecastTime) {
	var closest = [];
	routes.forEach((route) => {
		var closest_wpt = route.waypoints[0];
		let diff = Math.abs(forecastTime - closest_wpt.time);

		route.waypoints.forEach((wpt) => {
			const newdiff = Math.abs(forecastTime - wpt.time);
			if (newdiff < diff) {
				diff = newdiff;
				closest_wpt = wpt;
			}
		});
		closest.push(closest_wpt);
	});
	return closest;
  }

function calculateBearing(lat1, lon1, lat2, lon2) {
  // Convertir les degrés en radians
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const toDegrees = (rad) => (rad * 180) / Math.PI;

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  // Calculer le cap initial en radians
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let bearing = toDegrees(Math.atan2(x, y));

  // Normaliser le résultat pour qu'il soit entre 0 et 360
  return Math.round((bearing + 360) % 360);
}

// Afficher le tracé GPS sur la carte
function plotGpsData() {
	var i = 0;
	routes.forEach((route_data, index)  => {
		if (!route_data.ploted) {
			const route = route_data.waypoints;
			const color = route_data.color;
			//});
			const latlngs = route.map(point => [point.lat, point.lon]);

			// Ajouter les traces sur la carte Windy
			const polyline = L.polyline(latlngs, { color , weight: 2, opacity: 0.5 }).addTo(map);
			polylines.push(polyline);
			// Ajouter les points sur la carte Windy
			
			route.forEach((WP) => {
				const WPTimestamp = WP.time.getTime();
				const markerWP = new L.marker([WP.lat,parseFloat(WP.lon) >0 ? (parseFloat(WP.lon) % 360) - 360 : parseFloat(WP.lon)], {
				  icon: L.divIcon({
					className: 'marker-icon',
					html: `<div><svg width="4" height="4" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="2" fill="${color}" stroke-width="0"/></svg></div>`,
					iconSize: [4, 4],
					iconAnchor: [2, 12],
					opacity: 1
				}),});
				markerWP.on('click', () => store.set("timestamp",WPTimestamp));
				markerWP.addTo(map);
				routesWP.push({markerWP,i});
			});
			// Ajouter un marker à la première position
			  const firstWaypoint = route[0];
			  closestWaypoints.push(firstWaypoint);
				const marker = new L.marker([firstWaypoint.lat,parseFloat(firstWaypoint.lon) >0 ? (parseFloat(firstWaypoint.lon) % 360) - 360 : parseFloat(firstWaypoint.lon)], {
				  icon: L.divIcon({
					className: 'marker-icon',
					html: `<div style="transform: rotate(${firstWaypoint.COG}deg);">${currentIcon}</div>`,
					iconSize: [24, 24],
					iconAnchor: [12, 12],
				  }),
				});
				marker.on('click', () => changeIcon());
				marker.addTo(map);
			markers.push(marker);
			// Centrer la carte sur les données
			map.fitBounds(polyline.getBounds());
			//Récupérer les données de Windy
			fetchWindData();
		routes[index].ploted = true;
		};
		i++;
	});
}

// Fonction pour changer d'icone
function changeIcon() {
	if (isNormalIcon) {
		currentIcon = carrot_icon
		isNormalIcon = false;
	} else {
		currentIcon = normal_icon;
		isNormalIcon = true;
	}
	syncMarkerWithForecast(store.get("timestamp"));
}

// Fonction pour synchroniser le marqueur avec l'heure des prévisions
function syncMarkerWithForecast(forecastTime) {
	var i = 0;
	closestWaypoints = findClosestMarkerWithForecast(forecastTime);
	
	markers.forEach((marker) => {
	if (closestWaypoints) {
	  marker.setLatLng([closestWaypoints[i].lat, closestWaypoints[i].lon]);
	  marker.setIcon(L.divIcon({
		className: 'marker-icon',
		html: `<div style="transform: rotate(${closestWaypoints[i].COG}deg);">${currentIcon}</div>`,
		iconSize: [24, 24],
		iconAnchor: [12, 12],
	  }));
	  i++;
	}});
}

// Fonction pour récupérer et afficher les données
async function fetchWindData() {
	isLoading = true; // Active l'indicateur de chargement
    const listener = broadcast.once("redrawFinished", async () => {
        windDatas = [];

        for (const closestWaypoint of closestWaypoints) {
            const [lat, lon] = [closestWaypoint.lat, closestWaypoint.lon];

            try {
                const interpolateLatLon = await getLatLonInterpolator();

                if (!interpolateLatLon) {
                    console.error('No interpolator available for this overlay');
                    continue;
                }

                if (store.get('overlay') !== 'wind') {
                    console.error('Please select the wind overlay to interpolate wind values.');
                    continue;
                }

                const windData = interpolateLatLon({ lat, lon });

                if (Array.isArray(windData)) {
                    const { dir, wind } = wind2obj(windData);
                    // Convert wind speed to user's preferred units
                    const windSpeed = metrics.wind.convertValue(wind, " ");
                    const windDir = dir;
					const TWA = calculateTWA(dir, closestWaypoint.COG);

                    windDatas.push({ windSpeed, windDir, TWA });
                } else {
                    console.error("Invalid wind data:", windData);
                }
            } catch (error) {
                console.error("Error processing waypoint:", error);
            }
        }

		isLoading = false; // Désactive l'indicateur de chargement
        // Remove listener after processing
        broadcast.off(listener);
    });
}

//Supprime une route
function deleteRoute(routeIndex) {
	console.log("Deleting route ",routeIndex);
	if (polylines.length > 1) {
		//Supression des éléments affichés sur la map
		map.removeLayer(polylines[routeIndex]);
		map.removeLayer(markers[routeIndex]);
		map.removeLayer(routesWP[routeIndex]);
		routesWP.forEach((WP) => {
			if (WP.i == routeIndex) {
				map.removeLayer(WP.markerWP);
			}
		});
		
		//Supression des données de la route
		routes.splice(routeIndex, 1);
		closestWaypoints.splice(routeIndex, 1);
		polylines.splice(routeIndex, 1);
		markers.splice(routeIndex, 1);
		windDatas.splice(routeIndex, 1);
		colors.splice(routeIndex, 1);
		routesWP.splice(routeIndex, 1);
		filesList.splice(routeIndex, 1);
		for (let j = routesWP.length - 1; j >=0; j--) {
			if (routesWP[j].i == routeIndex) {
				routesWP.splice(j, 1);
			} else if (routesWP[j].i > routeIndex) {
				routesWP[j].i--;
			}
		};
		//fetchWindData()
		routes = [...routes];
	} else {		
		clearData();
	}
	
}	

// Clear all GPX data and reset the map
function clearData() {
	polylines.forEach((polyline) => {
        map.removeLayer(polyline);
    });
	
	markers.forEach((marker) => {
        map.removeLayer(marker);
    });
	
	routesWP.forEach((WP) => {
        map.removeLayer(WP.markerWP);
    });
	
	fileSelected = false;
	filesList = [];
	routes = [];
	closestWaypoints = []; 
	polylines = [];
	markers = [];
	isLoading = false; // Indicateur de chargement
	current_time = new Date(store.get("timestamp")).toLocaleString();
	fileSelected = false;
	windDatas = [];
	colors = [];
	ZE = [];
	routesWP = [];
}

// Fonction de gestion de l'événement de la case à cocher
function toggleZE() {
	if (!isShowZE) {
		showZE();
		isShowZE = true;
	} else {
		hideZE();
		isShowZE = false;
	}
}

onMount(() => {
	
});

onDestroy(() => {
clearData()
});

// Initialisation du plugin lorsque Windy est prêt
if (typeof W !== "undefined" && typeof store !== "undefined") {
	initPlugin();
} else {
	alert("pas init");
    document.addEventListener("windyLoaded", initPlugin);
}


</script>

<style>

 .ZE {
	margin-top: 20px;
  }
  
   .reset-button {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #fff;
    color: black;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }

  .reset-button:hover {
    background-color: #e63939;
  }
  
  table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f4f4f4;
  text-align: left;
  color: #4d4d4d;
}

td div {
  display: inline-block;
  border: 1px solid #000;
}

.add-button {
	display: inline-block;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background-color: #f4f4f4;
	color: #0056b3;
	font-size: 24px;
	font-weight: bold;
	text-align: center;
	line-height: 20px;
	cursor: pointer;
	border: none;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.add-button:hover {
	background-color: #0056b3;
	color: white;
}

.delete-button {
	display: inline-block;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background-color: transparent;
	color: #e63939;
	font-size: 24px;
	text-align: center;
	line-height: 20px;
	cursor: pointer;
	border: none;
}

.delete-button:hover {
	background-color: #e63939;
	color: #f4f4f4;
	font-weight: bold;
}

.delete-cell {
	border: none; 
	text-align: center; 
	padding: 0;
	background-color: transparent;
}

</style>


<section class="plugin__content">
    <div class="plugin__title">Windy4VR</div>
{#if !fileSelected}
<p>Sélectionnez un(des) fichier(s) GPX pour afficher la trace sur la map.</p>
    <input
      type="file"
	  accept=".gpx,.csv"
      multiple
      on:change={handleFileUpload}
    />
{/if}
	
{#if routes.length > 0}
<h3>Windy Data:</h3>
    <table>
      <thead>
        <tr>
          <th>Route</th>
          <th>TWS</th>
		  <th>TWD</th>
		  <th>TWA</th>
		  <th class="delete-cell"></th>
        </tr>
      </thead>
      <tbody>
	  
        {#each windDatas as windata, index}
          <tr>
            <td>
              <div style="width: 20px; height: 20px; background-color: {routes[index].color}" title="{routes[index].fileName}"></div>
            </td>
			<td>
				{#if !isLoading}{windata.windSpeed}{/if}
            </td>
			<td>
				{#if !isLoading}{windata.windDir}° {/if}
            </td>
			<td>
				{#if !isLoading}{windata.TWA}° {/if}
            </td>
			<td class="delete-cell">
				<button class="delete-button" id="deletefile" title="Supprimer la route" on:click={() => deleteRoute(index)}>–</button>
			</td>
          </tr>
        {/each}
	
      </tbody>
    </table>

<!-- Display selected waypoint details -->

    <h3>GPX Waypoint details</h3>
    <table>
      <thead>
        <tr>
          <th>Route</th>
          <th>HDG</th>
		  <th>Speed</th>
		  <th>TWS</th>
		  <th>TWA</th>
		  <th>Sail</th>
        </tr>
      </thead>
      <tbody>
	  
        {#each closestWaypoints as closestWaypoint, index}
          <tr>
            <td>
              <div style="width: 20px; height: 20px; background-color: {routes[index].color}" title="{routes[index].fileName}"></div>
            </td>
			<td>
				{closestWaypoint.COG || "N/A"}°
            </td>
			<td>
              {closestWaypoint.SOG || "N/A"} nds
            </td>
			<td>
              {closestWaypoint.TWS || "N/A"} nds
            </td>
			<td>
              {closestWaypoint.TWA || "N/A"}°
            </td>
			<td>
              {closestWaypoint.SAIL || "N/A"}
            </td>
          </tr>
        {/each}
	
      </tbody>
    </table>
	
    <br/>
	<label>
		<button class="add-button" id="addFileButton" on:click={() => document.getElementById('fileInput').click()}>+</button>
		Ajouter une route
	</label>
    <input type="file" id="fileInput" accept=".csv,.gpx" style="display: none;" multiple on:change={handleFileUpload}/>
	
	<label>
		<br/><input class="ZE" type="checkbox" on:click={toggleZE}> Zones d'exclusion VG2024<br/>
	</label>
{/if}
</section>