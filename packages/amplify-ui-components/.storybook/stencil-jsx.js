/**
 * Instead of programmatically creating web components,
 * convert JSX to a DOM node with Array/Object/Function support.
 *
 * (Other `h` utilities create vDOM trees.)
 *
 * @param tag string
 * @param props object | null
 * @param children array
 */

export const h = (tag, props, ...children) => {
	const node = document.createElement(tag);

	if (props) {
		Object.entries(props).forEach(([key, value]) => {
			if (key.match(/^on[A-Z]/)) {
				const eventName = key.charAt(2).toLowerCase() + key.slice(3);

				if (typeof value === 'function') {
					node.addEventListener(eventName, value);
				}
			}

			node[key] = value;
		});
	}

	children.forEach((child) => {
		if (['number', 'string'].includes(typeof child)) {
			node.appendChild(document.createTextNode(child));
		} else if (child === null) {
			node.appendChild(document.createComment(''));
		} else {
			node.appendChild(child);
		}
	});

	return node;
};
