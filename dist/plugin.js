const __pluginConfig =  {
  "name": "windy-plugin-windy4vr",
  "version": "1.0.8",
  "title": "Windy4VR",
  "icon": "🥕",
  "description": "Plugin windy pour visualiser son routage virtuel",
  "author": "Syraah",
  "repository": "https://github.com/Syraah/Windy4VR",
  "desktopUI": "rhpane",
  "mobileUI": "small",
  "desktopWidth": 400,
  "routerPath": "/windy4vr",
  "built": 1736010436924,
  "builtReadable": "2025-01-04T17:07:16.924Z"
};

// transformCode: import { map } from '@windy/map';
const { map } = W.map;

// transformCode: import store from '@windy/store';
const store = W.store;

// transformCode: import { wind2obj } from '@windy/utils';
const { wind2obj } = W.utils;

// transformCode: import { getLatLonInterpolator } from '@windy/interpolator';
const { getLatLonInterpolator } = W.interpolator;

// transformCode: import metrics from '@windy/metrics';
const metrics = W.metrics;

// transformCode: import broadcast from '@windy/broadcast';
const broadcast = W.broadcast;


/** @returns {void} */
function noop() {}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 * @returns {void}
 */
function append_styles(target, style_sheet_id, styles) {
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

/**
 * @param {Node} node
 * @returns {ShadowRoot | Document}
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return node.ownerDocument;
}

/**
 * @param {ShadowRoot | Document} node
 * @param {HTMLStyleElement} style
 * @returns {CSSStyleSheet}
 */
function append_stylesheet(node, style) {
	append(/** @type {Document} */ (node).head || node, style);
	return style.sheet;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @returns {void} */
function set_style(node, key, value, important) {
	if (value == null) {
		node.style.removeProperty(key);
	} else {
		node.style.setProperty(key, value, '');
	}
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs/svelte#onmount
 * @template T
 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs/svelte#ondestroy
 * @param {() => any} fn
 * @returns {void}
 */
function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

/* src\plugin.svelte generated by Svelte v4.2.19 */

function add_css(target) {
	append_styles(target, "svelte-xsvoth", ".ZE.svelte-xsvoth.svelte-xsvoth{margin-top:20px}table.svelte-xsvoth.svelte-xsvoth{width:100%;border-collapse:collapse;margin-top:20px}th.svelte-xsvoth.svelte-xsvoth,td.svelte-xsvoth.svelte-xsvoth{border:1px solid #ddd;padding:8px}th.svelte-xsvoth.svelte-xsvoth{background-color:#f4f4f4;text-align:left;color:#4d4d4d}td.svelte-xsvoth div.svelte-xsvoth{display:inline-block;border:1px solid #000}.add-button.svelte-xsvoth.svelte-xsvoth{display:inline-block;width:30px;height:30px;border-radius:50%;background-color:#f4f4f4;color:#0056b3;font-size:24px;font-weight:bold;text-align:center;line-height:20px;cursor:pointer;border:none;box-shadow:0 4px 6px rgba(0, 0, 0, 0.2)}.add-button.svelte-xsvoth.svelte-xsvoth:hover{background-color:#0056b3;color:white}.delete-button.svelte-xsvoth.svelte-xsvoth{display:inline-block;width:30px;height:30px;border-radius:50%;background-color:transparent;color:#e63939;font-size:24px;text-align:center;line-height:20px;cursor:pointer;border:none}.delete-button.svelte-xsvoth.svelte-xsvoth:hover{background-color:#e63939;color:#f4f4f4;font-weight:bold}.delete-cell.svelte-xsvoth.svelte-xsvoth{border:none;text-align:center;padding:0;background-color:transparent}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[41] = list[i];
	child_ctx[43] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[44] = list[i];
	child_ctx[43] = i;
	return child_ctx;
}

// (822:0) {#if routes.length > 0}
function create_if_block_2(ctx) {
	let h30;
	let t1;
	let table0;
	let thead0;
	let t10;
	let tbody0;
	let t11;
	let h31;
	let t13;
	let table1;
	let thead1;
	let t25;
	let tbody1;
	let t26;
	let br;
	let each_value_1 = ensure_array_like(/*windDatas*/ ctx[4]);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	let each_value = ensure_array_like(/*closestWaypoints*/ ctx[1]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			h30 = element("h3");
			h30.textContent = "Windy Data:";
			t1 = space();
			table0 = element("table");
			thead0 = element("thead");
			thead0.innerHTML = `<tr><th class="svelte-xsvoth">Route</th> <th class="svelte-xsvoth">TWS</th> <th class="svelte-xsvoth">TWD</th> <th class="svelte-xsvoth">TWA</th> <th class="delete-cell svelte-xsvoth"></th></tr>`;
			t10 = space();
			tbody0 = element("tbody");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t11 = space();
			h31 = element("h3");
			h31.textContent = "GPX Waypoint details";
			t13 = space();
			table1 = element("table");
			thead1 = element("thead");
			thead1.innerHTML = `<tr><th class="svelte-xsvoth">Route</th> <th class="svelte-xsvoth">HDG</th> <th class="svelte-xsvoth">Speed</th> <th class="svelte-xsvoth">TWS</th> <th class="svelte-xsvoth">TWA</th> <th class="svelte-xsvoth">Sail</th></tr>`;
			t25 = space();
			tbody1 = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t26 = space();
			br = element("br");
			attr(table0, "class", "svelte-xsvoth");
			attr(table1, "class", "svelte-xsvoth");
		},
		m(target, anchor) {
			insert(target, h30, anchor);
			insert(target, t1, anchor);
			insert(target, table0, anchor);
			append(table0, thead0);
			append(table0, t10);
			append(table0, tbody0);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				if (each_blocks_1[i]) {
					each_blocks_1[i].m(tbody0, null);
				}
			}

			insert(target, t11, anchor);
			insert(target, h31, anchor);
			insert(target, t13, anchor);
			insert(target, table1, anchor);
			append(table1, thead1);
			append(table1, t25);
			append(table1, tbody1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(tbody1, null);
				}
			}

			insert(target, t26, anchor);
			insert(target, br, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*deleteRoute, windDatas, isLoading, routes*/ 85) {
				each_value_1 = ensure_array_like(/*windDatas*/ ctx[4]);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_1(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(tbody0, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_1.length;
			}

			if (dirty[0] & /*closestWaypoints, routes*/ 3) {
				each_value = ensure_array_like(/*closestWaypoints*/ ctx[1]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(h30);
				detach(t1);
				detach(table0);
				detach(t11);
				detach(h31);
				detach(t13);
				detach(table1);
				detach(t26);
				detach(br);
			}

			destroy_each(each_blocks_1, detaching);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (842:4) {#if !isLoading}
function create_if_block_5(ctx) {
	let t_value = /*windata*/ ctx[44].windSpeed + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*windDatas*/ 16 && t_value !== (t_value = /*windata*/ ctx[44].windSpeed + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t);
			}
		}
	};
}

// (845:4) {#if !isLoading}
function create_if_block_4(ctx) {
	let t0_value = /*windata*/ ctx[44].windDir + "";
	let t0;
	let t1;

	return {
		c() {
			t0 = text(t0_value);
			t1 = text("°");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*windDatas*/ 16 && t0_value !== (t0_value = /*windata*/ ctx[44].windDir + "")) set_data(t0, t0_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
			}
		}
	};
}

// (848:4) {#if !isLoading}
function create_if_block_3(ctx) {
	let t0_value = /*windata*/ ctx[44].TWA + "";
	let t0;
	let t1;

	return {
		c() {
			t0 = text(t0_value);
			t1 = text("°");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*windDatas*/ 16 && t0_value !== (t0_value = /*windata*/ ctx[44].TWA + "")) set_data(t0, t0_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
			}
		}
	};
}

// (836:8) {#each windDatas as windata, index}
function create_each_block_1(ctx) {
	let tr;
	let td0;
	let div;
	let div_title_value;
	let t0;
	let td1;
	let t1;
	let td2;
	let t2;
	let td3;
	let t3;
	let td4;
	let button;
	let t5;
	let mounted;
	let dispose;
	let if_block0 = !/*isLoading*/ ctx[2] && create_if_block_5(ctx);
	let if_block1 = !/*isLoading*/ ctx[2] && create_if_block_4(ctx);
	let if_block2 = !/*isLoading*/ ctx[2] && create_if_block_3(ctx);

	function click_handler() {
		return /*click_handler*/ ctx[8](/*index*/ ctx[43]);
	}

	return {
		c() {
			tr = element("tr");
			td0 = element("td");
			div = element("div");
			t0 = space();
			td1 = element("td");
			if (if_block0) if_block0.c();
			t1 = space();
			td2 = element("td");
			if (if_block1) if_block1.c();
			t2 = space();
			td3 = element("td");
			if (if_block2) if_block2.c();
			t3 = space();
			td4 = element("td");
			button = element("button");
			button.textContent = "–";
			t5 = space();
			set_style(div, "width", "20px");
			set_style(div, "height", "20px");
			set_style(div, "background-color", /*routes*/ ctx[0][/*index*/ ctx[43]].color);
			attr(div, "title", div_title_value = /*routes*/ ctx[0][/*index*/ ctx[43]].fileName);
			attr(div, "class", "svelte-xsvoth");
			attr(td0, "class", "svelte-xsvoth");
			attr(td1, "class", "svelte-xsvoth");
			attr(td2, "class", "svelte-xsvoth");
			attr(td3, "class", "svelte-xsvoth");
			attr(button, "class", "delete-button svelte-xsvoth");
			attr(button, "id", "deletefile");
			attr(button, "title", "Supprimer la route");
			attr(td4, "class", "delete-cell svelte-xsvoth");
		},
		m(target, anchor) {
			insert(target, tr, anchor);
			append(tr, td0);
			append(td0, div);
			append(tr, t0);
			append(tr, td1);
			if (if_block0) if_block0.m(td1, null);
			append(tr, t1);
			append(tr, td2);
			if (if_block1) if_block1.m(td2, null);
			append(tr, t2);
			append(tr, td3);
			if (if_block2) if_block2.m(td3, null);
			append(tr, t3);
			append(tr, td4);
			append(td4, button);
			append(tr, t5);

			if (!mounted) {
				dispose = listen(button, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*routes*/ 1) {
				set_style(div, "background-color", /*routes*/ ctx[0][/*index*/ ctx[43]].color);
			}

			if (dirty[0] & /*routes*/ 1 && div_title_value !== (div_title_value = /*routes*/ ctx[0][/*index*/ ctx[43]].fileName)) {
				attr(div, "title", div_title_value);
			}

			if (!/*isLoading*/ ctx[2]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_5(ctx);
					if_block0.c();
					if_block0.m(td1, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (!/*isLoading*/ ctx[2]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_4(ctx);
					if_block1.c();
					if_block1.m(td2, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (!/*isLoading*/ ctx[2]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_3(ctx);
					if_block2.c();
					if_block2.m(td3, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(tr);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			mounted = false;
			dispose();
		}
	};
}

// (875:8) {#each closestWaypoints as closestWaypoint, index}
function create_each_block(ctx) {
	let tr;
	let td0;
	let div;
	let div_title_value;
	let t0;
	let td1;
	let t1_value = (/*closestWaypoint*/ ctx[41].COG || "N/A") + "";
	let t1;
	let t2;
	let t3;
	let td2;
	let t4_value = (/*closestWaypoint*/ ctx[41].SOG || "N/A") + "";
	let t4;
	let t5;
	let t6;
	let td3;
	let t7_value = (/*closestWaypoint*/ ctx[41].TWS || "N/A") + "";
	let t7;
	let t8;
	let t9;
	let td4;
	let t10_value = (/*closestWaypoint*/ ctx[41].TWA || "N/A") + "";
	let t10;
	let t11;
	let t12;
	let td5;
	let t13_value = (/*closestWaypoint*/ ctx[41].SAIL || "N/A") + "";
	let t13;
	let t14;

	return {
		c() {
			tr = element("tr");
			td0 = element("td");
			div = element("div");
			t0 = space();
			td1 = element("td");
			t1 = text(t1_value);
			t2 = text("°");
			t3 = space();
			td2 = element("td");
			t4 = text(t4_value);
			t5 = text(" nds");
			t6 = space();
			td3 = element("td");
			t7 = text(t7_value);
			t8 = text(" nds");
			t9 = space();
			td4 = element("td");
			t10 = text(t10_value);
			t11 = text("°");
			t12 = space();
			td5 = element("td");
			t13 = text(t13_value);
			t14 = space();
			set_style(div, "width", "20px");
			set_style(div, "height", "20px");
			set_style(div, "background-color", /*routes*/ ctx[0][/*index*/ ctx[43]].color);
			attr(div, "title", div_title_value = /*routes*/ ctx[0][/*index*/ ctx[43]].fileName);
			attr(div, "class", "svelte-xsvoth");
			attr(td0, "class", "svelte-xsvoth");
			attr(td1, "class", "svelte-xsvoth");
			attr(td2, "class", "svelte-xsvoth");
			attr(td3, "class", "svelte-xsvoth");
			attr(td4, "class", "svelte-xsvoth");
			attr(td5, "class", "svelte-xsvoth");
		},
		m(target, anchor) {
			insert(target, tr, anchor);
			append(tr, td0);
			append(td0, div);
			append(tr, t0);
			append(tr, td1);
			append(td1, t1);
			append(td1, t2);
			append(tr, t3);
			append(tr, td2);
			append(td2, t4);
			append(td2, t5);
			append(tr, t6);
			append(tr, td3);
			append(td3, t7);
			append(td3, t8);
			append(tr, t9);
			append(tr, td4);
			append(td4, t10);
			append(td4, t11);
			append(tr, t12);
			append(tr, td5);
			append(td5, t13);
			append(tr, t14);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*routes*/ 1) {
				set_style(div, "background-color", /*routes*/ ctx[0][/*index*/ ctx[43]].color);
			}

			if (dirty[0] & /*routes*/ 1 && div_title_value !== (div_title_value = /*routes*/ ctx[0][/*index*/ ctx[43]].fileName)) {
				attr(div, "title", div_title_value);
			}

			if (dirty[0] & /*closestWaypoints*/ 2 && t1_value !== (t1_value = (/*closestWaypoint*/ ctx[41].COG || "N/A") + "")) set_data(t1, t1_value);
			if (dirty[0] & /*closestWaypoints*/ 2 && t4_value !== (t4_value = (/*closestWaypoint*/ ctx[41].SOG || "N/A") + "")) set_data(t4, t4_value);
			if (dirty[0] & /*closestWaypoints*/ 2 && t7_value !== (t7_value = (/*closestWaypoint*/ ctx[41].TWS || "N/A") + "")) set_data(t7, t7_value);
			if (dirty[0] & /*closestWaypoints*/ 2 && t10_value !== (t10_value = (/*closestWaypoint*/ ctx[41].TWA || "N/A") + "")) set_data(t10, t10_value);
			if (dirty[0] & /*closestWaypoints*/ 2 && t13_value !== (t13_value = (/*closestWaypoint*/ ctx[41].SAIL || "N/A") + "")) set_data(t13, t13_value);
		},
		d(detaching) {
			if (detaching) {
				detach(tr);
			}
		}
	};
}

// (902:0) {#if !fileSelected}
function create_if_block_1(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Sélectionnez un(des) fichier(s) pour afficher la trace sur la map.";
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (912:0) {:else}
function create_else_block(ctx) {
	let br0;
	let t0;
	let label;
	let br1;
	let input;
	let t1;
	let br2;
	let mounted;
	let dispose;

	return {
		c() {
			br0 = element("br");
			t0 = space();
			label = element("label");
			br1 = element("br");
			input = element("input");
			t1 = text(" Zones d'exclusion VG2024");
			br2 = element("br");
			attr(input, "class", "ZE svelte-xsvoth");
			attr(input, "type", "checkbox");
		},
		m(target, anchor) {
			insert(target, br0, anchor);
			insert(target, t0, anchor);
			insert(target, label, anchor);
			append(label, br1);
			append(label, input);
			append(label, t1);
			append(label, br2);

			if (!mounted) {
				dispose = listen(input, "click", /*toggleZE*/ ctx[7]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(br0);
				detach(t0);
				detach(label);
			}

			mounted = false;
			dispose();
		}
	};
}

// (910:0) {#if !fileSelected}
function create_if_block(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Formats supportés: Avalon, Dorado, QTVLM, VRZen, Zezo";
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

function create_fragment(ctx) {
	let section;
	let div;
	let t1;
	let t2;
	let t3;
	let label;
	let button;
	let t5;
	let t6;
	let input;
	let t7;
	let mounted;
	let dispose;
	let if_block0 = /*routes*/ ctx[0].length > 0 && create_if_block_2(ctx);
	let if_block1 = !/*fileSelected*/ ctx[3] && create_if_block_1();

	function select_block_type(ctx, dirty) {
		if (!/*fileSelected*/ ctx[3]) return create_if_block;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block2 = current_block_type(ctx);

	return {
		c() {
			section = element("section");
			div = element("div");
			div.textContent = "Windy4VR";
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			t3 = space();
			label = element("label");
			button = element("button");
			button.textContent = "+";
			t5 = text("\r\n\t\tAjouter une route");
			t6 = space();
			input = element("input");
			t7 = space();
			if_block2.c();
			attr(div, "class", "plugin__title");
			attr(button, "class", "add-button svelte-xsvoth");
			attr(button, "id", "addFileButton");
			attr(input, "type", "file");
			attr(input, "id", "fileInput");
			attr(input, "accept", ".csv,.gpx");
			set_style(input, "display", "none");
			input.multiple = true;
			attr(section, "class", "plugin__content");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, div);
			append(section, t1);
			if (if_block0) if_block0.m(section, null);
			append(section, t2);
			if (if_block1) if_block1.m(section, null);
			append(section, t3);
			append(section, label);
			append(label, button);
			append(label, t5);
			append(section, t6);
			append(section, input);
			append(section, t7);
			if_block2.m(section, null);

			if (!mounted) {
				dispose = [
					listen(button, "click", /*click_handler_1*/ ctx[9]),
					listen(input, "change", /*handleFileUpload*/ ctx[5])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*routes*/ ctx[0].length > 0) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_2(ctx);
					if_block0.c();
					if_block0.m(section, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (!/*fileSelected*/ ctx[3]) {
				if (if_block1) ; else {
					if_block1 = create_if_block_1();
					if_block1.c();
					if_block1.m(section, t3);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
				if_block2.p(ctx, dirty);
			} else {
				if_block2.d(1);
				if_block2 = current_block_type(ctx);

				if (if_block2) {
					if_block2.c();
					if_block2.m(section, null);
				}
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(section);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if_block2.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function readGPX(file) {
	return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = e => resolve(e.target.result);
			reader.onerror = err => reject(err);
			reader.readAsText(file);
		});
}

function dmsToDecimal(coord) {
	const regex = /(\d+)[^\d]+([\d.]+)\s*([NSEW])/i;
	const match = coord.match(regex);

	if (!match) {
		throw new Error(`Coordonnée invalide : ${coord}`);
	}

	const degrees = parseFloat(match[1]);
	const minutes = parseFloat(match[2]);
	const direction = match[3].toUpperCase();
	let decimal = degrees + minutes / 60;

	if (direction === 'S' || direction === 'W') {
		decimal = -decimal;
	}

	return decimal;
}

function completeDateWithYearTransition(dateString, currentYear) {
	const [day, monthAndTime] = dateString.split('/');
	const [month, time] = monthAndTime.split(' ');
	return new Date(`${currentYear}-${month}-${day}T${time}`);
}

function calculateTWA(wind, boatHeading) {
	let TWA = (wind - boatHeading + 360) % 360;

	if (TWA > 180) {
		TWA -= 360;
	}

	return Math.round(TWA);
}

function detectFormatCSV(headers) {
	if (headers.includes('Date') && headers.includes('Latitude') && headers.includes('Longitude')) {
		return 'Avalon';
	}

	if (headers.includes('position') && headers.includes('time') && headers.includes('sog')) {
		return 'Dorado';
	}

	return 'Unknown';
}

function calculateBearing(lat1, lon1, lat2, lon2) {
	const toRadians = deg => deg * Math.PI / 180;
	const toDegrees = rad => rad * 180 / Math.PI;
	const φ1 = toRadians(lat1);
	const φ2 = toRadians(lat2);
	const Δλ = toRadians(lon2 - lon1);
	const x = Math.sin(Δλ) * Math.cos(φ2);
	const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
	let bearing = toDegrees(Math.atan2(x, y));
	return Math.round((bearing + 360) % 360);
}

function instance($$self, $$props, $$invalidate) {
	let routes = [];
	let routesWP = [];
	let closestWaypoints = [];
	let markers = [];
	let isLoading = false;
	new Date(store.get("timestamp")).toLocaleString();
	let fileSelected = false;
	let polylines = [];
	let windDatas = [];
	let format = null;
	let filesList = [];
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
		[
			{ lat: 43.523333, lng: -10.086667 },
			{ lat: 43.35, lng: -9.606667 },
			{ lat: 43.175, lng: -9.733333 },
			{ lat: 42.88, lng: -9.733333 },
			{ lat: 42.88, lng: -10.230833 },
			{ lat: 43.315833, lng: -10.230833 }
		],
		[
			{ lat: 38.866667, lng: -9.685 },
			{ lat: 38.661667, lng: -9.666667 },
			{ lat: 38.565, lng: -10.195 },
			{ lat: 38.681667, lng: -10.23 },
			{ lat: 38.866667, lng: -10.23 }
		],
		[
			{ lat: 37.041667, lng: -9.195 },
			{ lat: 36.945, lng: -9.171667 },
			{ lat: 36.858333, lng: -9.071667 },
			{ lat: 36.835, lng: -8.953333 },
			{ lat: 36.42, lng: -9.1 },
			{ lat: 36.474333, lng: -9.36 },
			{ lat: 36.736667, lng: -9.664583 },
			{ lat: 36.943333, lng: -9.721667 }
		],
		[
			{ lat: 28.33, lng: -14.795 },
			{ lat: 27.813, lng: -15.005833 },
			{ lat: 27.858333, lng: -15.1475 },
			{ lat: 28.341667, lng: -14.951667 }
		],
		[
			{ lat: 28.563333, lng: -15.655 },
			{ lat: 27.973333, lng: -16.215833 },
			{ lat: 28.0575, lng: -16.3275 },
			{ lat: 28.635, lng: -15.78 }
		],
		[
			{ lat: 21.516667, lng: -16.416667 },
			{ lat: 16.0, lng: -16.416667 },
			{ lat: 16.0, lng: -17.583333 },
			{ lat: 21.516667, lng: -17.583333 }
		],
		[
			{ lat: -21.5, lng: -39.75 },
			{ lat: -21.933333, lng: -39.233333 },
			{ lat: -23.0, lng: -40.220833 },
			{ lat: -23.5775, lng: -41.015 },
			{ lat: -23.483333, lng: -41.633333 },
			{ lat: -22.133333, lng: -40.416667 }
		],
		[
			{ lat: -24.9, lng: -42.85 },
			{ lat: -25.5, lng: -42.263333 },
			{ lat: -25.916667, lng: -43.333333 },
			{ lat: -25.505833, lng: -43.75 }
		],
		[
			{ lat: 40.9, lng: -28.566667 },
			{ lat: 37.81, lng: -23.833333 },
			{ lat: 36.626667, lng: -24.216667 },
			{ lat: 36.34, lng: -25.593333 },
			{ lat: 37.583333, lng: -31.856667 },
			{ lat: 40.0, lng: -31.833333 }
		],
		[
			{ lat: 17.75, lng: -25.35 },
			{ lat: 17.7, lng: -22.666667 },
			{ lat: 15.966667, lng: -22.133333 },
			{ lat: 14.533333, lng: -22.833333 },
			{ lat: 14.666667, lng: -25.416667 },
			{ lat: 16.166667, lng: -26.133333 }
		],
		[
			{ lat: 49.7675, lng: -6.275833 },
			{ lat: 49.592333, lng: -6.273333 },
			{ lat: 49.5925, lng: -6.568333 },
			{ lat: 49.767167, lng: -6.4925 }
		],
		[
			{ lat: 49.034167, lng: -5.611667 },
			{ lat: 48.81, lng: -5.416667 },
			{ lat: 48.62, lng: -5.1975 },
			{ lat: 48.489167, lng: -5.3675 },
			{ lat: 48.583333, lng: -5.708333 },
			{ lat: 48.708333, lng: -6.051667 },
			{ lat: 48.94, lng: -5.86 }
		],
		[
			{ lat: 46.952167, lng: -2.526667 },
			{ lat: 46.848583, lng: -2.404333 },
			{ lat: 46.800417, lng: -2.491083 },
			{ lat: 46.884583, lng: -2.590583 },
			{ lat: 46.916083, lng: -2.59175 }
		],
		[
			{ lat: -44.0, lng: 0.0 },
			{ lat: -44.25, lng: 5.0 },
			{ lat: -44.8333, lng: 10.0 },
			{ lat: -45.4167, lng: 15.0 },
			{ lat: -46.0, lng: 20.0 },
			{ lat: -46.75, lng: 25.0 },
			{ lat: -47.5, lng: 30.0 },
			{ lat: -47.75, lng: 35.0 },
			{ lat: -48.0, lng: 40.0 },
			{ lat: -48.75, lng: 45.0 },
			{ lat: -49.3333, lng: 50.0 },
			{ lat: -49.8333, lng: 55.0 },
			{ lat: -50.25, lng: 60.0 },
			{ lat: -50.5833, lng: 65.0 },
			{ lat: -50.9167, lng: 70.0 },
			{ lat: -50.9167, lng: 75.0 },
			{ lat: -50.6667, lng: 80.0 },
			{ lat: -50.4167, lng: 85.0 },
			{ lat: -50.0, lng: 90.0 },
			{ lat: -49.0, lng: 95.0 },
			{ lat: -46.0, lng: 100.0 },
			{ lat: -46.0, lng: 105.0 },
			{ lat: -46.0, lng: 110.0 },
			{ lat: -46.0, lng: 115.0 },
			{ lat: -49.0, lng: 120.0 },
			{ lat: -49.75, lng: 125.0 },
			{ lat: -50.0, lng: 130.0 },
			{ lat: -50.0, lng: 135.0 },
			{ lat: -50.0, lng: 140.0 },
			{ lat: -50.0, lng: 145.0 },
			{ lat: -50.0, lng: 150.0 },
			{ lat: -56.0833, lng: 155.0 },
			{ lat: -56.3333, lng: 160.0 },
			{ lat: -56.5, lng: 165.0 },
			{ lat: -56.6667, lng: 170.0 },
			{ lat: -57.3333, lng: 175.0 },
			{ lat: -58.0, lng: 180.0 },
			{ lat: -80.0, lng: 180.0 },
			{ lat: -80, lng: -175.0 },
			{ lat: -58.25, lng: -175.0 },
			{ lat: -58.25, lng: -170.0 },
			{ lat: -58.0, lng: -165.0 },
			{ lat: -57.25, lng: -160.0 },
			{ lat: -56.5, lng: -155.0 },
			{ lat: -55.75, lng: -150.0 },
			{ lat: -55.0, lng: -145.0 },
			{ lat: -54.25, lng: -140.0 },
			{ lat: -54.0, lng: -135.0 },
			{ lat: -54.25, lng: -130.0 },
			{ lat: -54.75, lng: -125.0 },
			{ lat: -55.25, lng: -120.0 },
			{ lat: -55.75, lng: -115.0 },
			{ lat: -57.5, lng: -110.0 },
			{ lat: -58.25, lng: -105.0 },
			{ lat: -58.8333, lng: -100.0 },
			{ lat: -59.1667, lng: -95.0 },
			{ lat: -59.5, lng: -90.0 },
			{ lat: -59.6667, lng: -85.0 },
			{ lat: -59.5, lng: -80.0 },
			{ lat: -59.25, lng: -75.0 },
			{ lat: -58.75, lng: -70.0 },
			{ lat: -58.0, lng: -65.0 },
			{ lat: -56.5, lng: -60.0 },
			{ lat: -54.0, lng: -55.0 },
			{ lat: -45.0, lng: -50.0 },
			{ lat: -44.0, lng: -45.0 },
			{ lat: -44.0, lng: -40.0 },
			{ lat: -44.0, lng: -35.0 },
			{ lat: -43.5, lng: -30.0 },
			{ lat: -43.0, lng: -25.0 },
			{ lat: -43.0, lng: -20.0 },
			{ lat: -43.0, lng: -15.0 },
			{ lat: -43.0, lng: -10.0 },
			{ lat: -43.5, lng: -5.0 }
		]
	];

	function initPlugin() {
		if (typeof store === 'undefined') {
			console.error("Windy store is not available.");
			return;
		}

		let previousTimestamp = store.get("timestamp");
		store.get("product");

		store.on("timestamp", newTimestamp => {
			const date = new Date(newTimestamp);

			if (newTimestamp !== previousTimestamp) {
				previousTimestamp = newTimestamp;
				syncMarkerWithForecast(date);
				fetchWindData();
			}
		});

		store.on("product", newProduct => {
			fetchWindData();
		});

		console.log("Plugin initialized and listening for timestamp changes.");
	}

	async function handleFileUpload(event) {
		const files = Array.from(event.target.files);
		$$invalidate(3, fileSelected = true);
		files.length;

		for (const file of files) {
			if (filesList.indexOf(file.name) == -1) {
				filesList.push(file.name);

				try {
					const fileExtension = file.name.split('.').pop().toLowerCase();
					hue = (hue + 60) % 360;
					const color = `hsl(${hue}, 100%, 45%)`;
					var waypoints = [];

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

					$$invalidate(0, routes = [
						...routes,
						{
							fileName: file.name,
							waypoints,
							ploted: false,
							color
						}
					]);
				} catch(err) {
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

	function readCSV(file) {
		return new Promise((resolve, reject) => {
				const reader = new FileReader();

				reader.onload = event => {
					const text = event.target.result;
					const rows = text.split('\n').map(row => row.trim());
					const nonEmptyRows = rows.filter(row => row.length > 0);
					const headers = nonEmptyRows[0].split(';');

					const data = nonEmptyRows.slice(1).map(row => {
						const values = row.split(';');

						return headers.reduce(
							(acc, header, index) => {
								acc[header] = values[index];
								return acc;
							},
							{}
						);
					});

					CSVformat = detectFormatCSV(headers);
					resolve(data);
				};

				reader.onerror = err => reject(err);
				reader.readAsText(file);
			});
	}

	function parseCSV(data) {
		var parsedData = [];

		if (CSVformat == "Avalon") {
			let currentYear = new Date().getFullYear();
			let previousDate = null;

			parsedData = data.map(row => {
				const rawDate = row['Date'];
				let parsedDate = completeDateWithYearTransition(rawDate, currentYear);

				if (previousDate && parsedDate < previousDate) {
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
				};
			});
		} else if (CSVformat == "Dorado") {
			parsedData = data.map(row => {
				const [lat, lon] = row.position.split('  ').map(coord => dmsToDecimal(coord.trim()));

				return {
					lat,
					lon,
					time: new Date(row.time),
					SOG: parseFloat(row.sog),
					TWS: parseFloat(row.TWS),
					TWD: parseFloat(row.TWD),
					SOG: parseFloat(row['current speed']),
					COG: parseFloat(row['current dir.'])
				};
			});
		}

		for (let i = 0; i < parsedData.length - 1; i++) {
			var WP = parsedData[i];

			if (WP.COG == 0) {
				var nextWP = parsedData[i + 1];
				var COG = calculateBearing(WP.lat, WP.lon, nextWP.lat, nextWP.lon);
				parsedData[i].COG = COG;
			}
		}

		parsedData[parsedData.length - 1].COG = parsedData[parsedData.length - 2].COG;
		return parsedData;
	}

	function parseGpx(gpxString) {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(gpxString, "application/xml");
		const wptNodes = xmlDoc.querySelectorAll("wpt");
		const rteptNodes = xmlDoc.querySelectorAll("rtept");

		if (wptNodes.length == 0) {
			const rteptData = [];

			rteptNodes.forEach(rtept => {
				const lat = parseFloat(rtept.getAttribute("lat"));

				const lon = parseFloat(rtept.getAttribute('lon')) > 0
				? parseFloat(rtept.getAttribute('lon')) % 360 - 360
				: parseFloat(rtept.getAttribute('lon'));

				const timeString = rtept.querySelector("time")?.textContent || null;
				const time = timeString ? new Date(timeString) : null;
				const name = rtept.querySelector("name")?.textContent || "Unknown";
				rteptData.push({ lat, lon, time, name });
			});

			for (let i = 0; i < rteptData.length - 1; i++) {
				var WP = rteptData[i];
				var nextWP = rteptData[i + 1];
				var COG = calculateBearing(WP.lat, WP.lon, nextWP.lat, nextWP.lon);
				rteptData[i].COG = COG;
			}

			rteptData[rteptData.length - 1].COG = rteptData[rteptData.length - 2].COG;
			return rteptData;
		} else {
			const desc = xmlDoc.querySelector('desc')?.textContent;
			if (!desc) return { error: 'No desc tag found' };
			const descFormat = detectFormatGPX(desc);
			const wptData = [];

			wptNodes.forEach(wpt => {
				const lat = parseFloat(wpt.getAttribute("lat"));

				const lon = parseFloat(wpt.getAttribute('lon')) > 0
				? parseFloat(wpt.getAttribute('lon')) % 360 - 360
				: parseFloat(wpt.getAttribute('lon'));

				const ele = parseFloat(wpt.querySelector("ele")?.textContent || "0");
				const timeString = wpt.querySelector("time")?.textContent || null;
				const time = timeString ? new Date(timeString) : null;
				const name = wpt.querySelector("name")?.textContent || "Unknown";
				const desc = wpt.querySelector("desc")?.textContent || "";
				const match = desc.match(format);

				if (descFormat == 1) {
					wptData.push({
						lat,
						lon,
						ele,
						time,
						name,
						COG: match ? parseFloat(match[1].replace(",", ".")) : null,
						SOG: match ? parseFloat(match[2].replace(",", ".")) : null,
						TWS: match ? parseFloat(match[3].replace(",", ".")) : null,
						TWA: match ? parseFloat(match[4].replace(",", ".")) : null,
						SAIL: match ? match[5] : null
					});
				} else if (descFormat == 2 && match != null) {
					wptData.push({
						lat,
						lon,
						ele,
						time,
						name,
						COG: match[1],
						SOG: match[4],
						TWS: match[5],
						TWA: match[2],
						SAIL: match[3]
					});
				}
			});

			for (let i = 0; i < wptData.length - 1; i++) {
				var WP = wptData[i];

				if (WP.COG == 0) {
					var nextWP = wptData[i + 1];
					var COG = calculateBearing(WP.lat, WP.lon, nextWP.lat, nextWP.lon);
					wptData[i].COG = COG;
					console.log(COG);
				}
			}

			wptData[wptData.length - 1].COG = wptData[wptData.length - 2].COG;
			return wptData;
		}
	}

	function showZE() {
		Object.entries(zonesInterdites).forEach(([zoneName, coordinates]) => {
			var polygon = L.polygon(coordinates, { color: 'red' }).addTo(map);
			ZE.push(polygon);
		});
	}

	function hideZE() {
		ZE.forEach(zone => {
			map.removeLayer(zone);
		});
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

	function findClosestMarkerWithForecast(forecastTime) {
		var closest = [];

		routes.forEach(route => {
			var closest_wpt = route.waypoints[0];
			let diff = Math.abs(forecastTime - closest_wpt.time);

			route.waypoints.forEach(wpt => {
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

	function plotGpsData() {
		var i = 0;

		routes.forEach((route_data, index) => {
			if (!route_data.ploted) {
				const route = route_data.waypoints;
				const color = route_data.color;
				const latlngs = route.map(point => [point.lat, point.lon]);
				const polyline = L.polyline(latlngs, { color, weight: 2, opacity: 0.5 }).addTo(map);
				polylines.push(polyline);

				route.forEach(WP => {
					const WPTimestamp = WP.time.getTime();

					const markerWP = new L.marker([
							WP.lat,
							parseFloat(WP.lon) > 0
							? parseFloat(WP.lon) % 360 - 360
							: parseFloat(WP.lon)
						],
					{
							icon: L.divIcon({
								className: 'marker-icon',
								html: `<div><svg width="4" height="4" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="2" fill="${color}" stroke-width="0"/></svg></div>`,
								iconSize: [4, 4],
								iconAnchor: [2, 12],
								opacity: 1
							})
						});

					markerWP.on('click', () => store.set("timestamp", WPTimestamp));
					markerWP.addTo(map);
					routesWP.push({ markerWP, i });
				});

				const firstWaypoint = route[0];
				closestWaypoints.push(firstWaypoint);

				const marker = new L.marker([
						firstWaypoint.lat,
						parseFloat(firstWaypoint.lon) > 0
						? parseFloat(firstWaypoint.lon) % 360 - 360
						: parseFloat(firstWaypoint.lon)
					],
				{
						icon: L.divIcon({
							className: 'marker-icon',
							html: `<div style="transform: rotate(${firstWaypoint.COG}deg);">${currentIcon}</div>`,
							iconSize: [24, 24],
							iconAnchor: [12, 12]
						})
					});

				marker.on('click', () => changeIcon());
				marker.addTo(map);
				markers.push(marker);
				map.fitBounds(polyline.getBounds());
				fetchWindData();
				$$invalidate(0, routes[index].ploted = true, routes);
			}
			i++;
		});
	}

	function changeIcon() {
		if (isNormalIcon) {
			currentIcon = carrot_icon;
			isNormalIcon = false;
		} else {
			currentIcon = normal_icon;
			isNormalIcon = true;
		}

		syncMarkerWithForecast(store.get("timestamp"));
	}

	function syncMarkerWithForecast(forecastTime) {
		var i = 0;
		$$invalidate(1, closestWaypoints = findClosestMarkerWithForecast(forecastTime));

		markers.forEach(marker => {
			if (closestWaypoints) {
				marker.setLatLng([closestWaypoints[i].lat, closestWaypoints[i].lon]);

				marker.setIcon(L.divIcon({
					className: 'marker-icon',
					html: `<div style="transform: rotate(${closestWaypoints[i].COG}deg);">${currentIcon}</div>`,
					iconSize: [24, 24],
					iconAnchor: [12, 12]
				}));

				i++;
			}
		});
	}

	async function fetchWindData() {
		$$invalidate(2, isLoading = true);

		const listener = broadcast.once("redrawFinished", async () => {
			$$invalidate(4, windDatas = []);

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
						const windSpeed = metrics.wind.convertValue(wind, " ");
						const windDir = dir;
						const TWA = calculateTWA(dir, closestWaypoint.COG);
						windDatas.push({ windSpeed, windDir, TWA });
					} else {
						console.error("Invalid wind data:", windData);
					}
				} catch(error) {
					console.error("Error processing waypoint:", error);
				}
			}

			$$invalidate(2, isLoading = false);
			broadcast.off(listener);
		});
	}

	function deleteRoute(routeIndex) {
		console.log("Deleting route ", routeIndex);

		if (polylines.length > 1) {
			map.removeLayer(polylines[routeIndex]);
			map.removeLayer(markers[routeIndex]);
			map.removeLayer(routesWP[routeIndex]);

			routesWP.forEach(WP => {
				if (WP.i == routeIndex) {
					map.removeLayer(WP.markerWP);
				}
			});

			routes.splice(routeIndex, 1);
			closestWaypoints.splice(routeIndex, 1);
			polylines.splice(routeIndex, 1);
			markers.splice(routeIndex, 1);
			windDatas.splice(routeIndex, 1);
			colors.splice(routeIndex, 1);
			routesWP.splice(routeIndex, 1);
			filesList.splice(routeIndex, 1);

			for (let j = routesWP.length - 1; j >= 0; j--) {
				if (routesWP[j].i == routeIndex) {
					routesWP.splice(j, 1);
				} else if (routesWP[j].i > routeIndex) {
					routesWP[j].i--;
				}
			}
			$$invalidate(0, routes = [...routes]);
		} else {
			clearData();
		}
	}

	function clearData() {
		polylines.forEach(polyline => {
			map.removeLayer(polyline);
		});

		markers.forEach(marker => {
			map.removeLayer(marker);
		});

		routesWP.forEach(WP => {
			map.removeLayer(WP.markerWP);
		});

		$$invalidate(3, fileSelected = false);
		filesList = [];
		$$invalidate(0, routes = []);
		$$invalidate(1, closestWaypoints = []);
		polylines = [];
		markers = [];
		$$invalidate(2, isLoading = false);
		new Date(store.get("timestamp")).toLocaleString();
		$$invalidate(3, fileSelected = false);
		$$invalidate(4, windDatas = []);
		colors = [];
		ZE = [];
		routesWP = [];
	}

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
		clearData();
	});

	if (typeof W !== "undefined" && typeof store !== "undefined") {
		initPlugin();
	} else {
		alert("pas init");
		document.addEventListener("windyLoaded", initPlugin);
	}

	const click_handler = index => deleteRoute(index);
	const click_handler_1 = () => document.getElementById('fileInput').click();

	return [
		routes,
		closestWaypoints,
		isLoading,
		fileSelected,
		windDatas,
		handleFileUpload,
		deleteRoute,
		toggleZE,
		click_handler,
		click_handler_1
	];
}

class Plugin extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {}, add_css, [-1, -1]);
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, Plugin as default };
//# sourceMappingURL=plugin.js.map
