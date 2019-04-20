function textNode(v) {
    return document.createTextNode(v);
}

export function buildFragment(...content) {
    const el = document.createDocumentFragment()
    append(el, ...content)
    return el
}

/**
 * Converts anything into a html Node of some type
 * @param {any} v
 * @returns {Node}
 */
function toNode(v) {
    switch (typeof v) {
        case "string":
        case "number":
        case "boolean":
            return textNode(v);
        case "object":
            if (v instanceof Node) {
                return v
            } else if (Array.isArray(v)) {
                const f = buildFragment()
                for (let i = 0; i < v.length; i += 1) {
                    if (v[i] !== undefined) {
                        f.appendChild(toNode(v[i]))
                    }
                }
                return f
            } else {
                return textNode(JSON.stringify(v))
            }
        case "function":
            return toNode(v())
        case "undefined":
            // skip it
            return textNode()
        default:
            console.warn("Cant convert to node: ", v)
            return textNode("")
    }
}

/**
 * Create a new DOM element
 * @param {string} name The name of the tag
 * @param {object|string} [options] Attributes to set on the object
 * @param {...any} [contents] Things to fill the new element
 * @returns {HTMLElement} the new element
 */
export function buildElement(name, options, ...contents) {

    const el = document.createElement(name);

    switch (typeof options) {
        case "string":
            el.setAttribute("class", options)
            break;
        case "object":
            for (let k in options) {
                const v = options[k];
                if (v !== undefined) {
                    el.setAttribute(k, v)
                }
            }
            break;
    }

    for (let i = 0; i < contents.length; i += 1) {
        if (contents[i] !== undefined) {
            el.appendChild(toNode(contents[i]))
        }
    }

    return el;
}

export function $(a, b) {
    if (b !== undefined) {
        return a.querySelector(b)
    } else {
        if (a instanceof HTMLElement) {
            return a
        }
        return document.querySelector(a)
    }
}

export function $$(a, b) {
    if (b !== undefined) {
        return Array.from(a.querySelectorAll(b))
    } else {
        return Array.from(document.querySelectorAll(a))
    }
}

/**
 * Remove all the children of a node
 * @param {Node} n
 * @returns {Node} the empty node
 */
export function empty(n) {
    while (n.firstChild) {
        n.removeChild(n.firstChild)
    }
    return n;
}

/**
 * Appends arbitary children to a node
 * @param {Node} n
 * @param {...any} [contents]
 * @returns {Node} the updated node
 */
export function append(n, ...contents) {
    for (let i = 0; i < contents.length; i += 1) {
        try {
            if (contents[i] !== undefined) {
                n.appendChild(toNode(contents[i]))
            }
        } catch (e) {
            console.warn("Can't append node", e)
        }
    }
    return n
}

function animate(animation, speed, selector) {
    return new Promise((resolve, reject) => {
        const target = $(selector)
        target.classList.add(animation)
        target.classList.add("animate-" + speed)

        const done = e => {
            resolve(target)
            target.classList.remove(animation)
            target.classList.remove("animate-" + speed)
            target.removeEventListener("animationend", done)
        }

        target.addEventListener("animationend", done)
    })
}

function fade(dir, speed, selector) {
    return animate("fade-" + dir, speed, selector)
}

export function alert(type, ...contents) {
    const thisAlert = buildElement("div", "alert alert-" + type, contents)

    append($("#alert"), thisAlert)
    setTimeout(() => {
        fade("out", "slow", thisAlert).then(t => t.parentNode.removeChild(t))
    }, 3000)
}


export function error(message) {
    return e => {
        console.error(message, e)
        alert("error", message)
    }
}

export function warning(message) {
    return e => {
        console.warn(message, e)
        alert("warning", message)
    }
}

export function buildInputBlock(options) {
    const iptOptions = {}
    for (let k in options) {
        if (k.startsWith("ipt")) {
            iptOptions[k.substring(3).toLowerCase()] = options[k]
        }
    }

    let classes = "input-block";
    if (options.border) {
        classes += " border"
    }

    return buildElement("div", classes,
        "label" in options ?
        buildElement("label", {
            for: options.iptId
        }, options.label) : undefined,
        buildElement("input", iptOptions)
    )
}

/**
 * Create a command link
 * @param {string} command The command to call when the link is clicked
 * @param {...any} contents
 * @returns {HTMLAnchorElement}
 */
export function buildCommand(command, ...contents) {
    if (command !== undefined && command.length > 0) {
        return buildElement("a", {
            href: "#" + command,
            class: "command"
        }, contents)
    } else {
        return buildElement("span", "command", contents)
    }
}

export function formValidator(inputSelector, buttonSelector) {
    return function () {
        let valid = true
        $$(inputSelector).forEach(i => {
            if (!i.checkValidity()) {
                valid = false
            }
        })

        if (valid) {
            enable(buttonSelector)
        } else {
            disable(buttonSelector)
        }
    }
}

export function enable(selector) {
    $(selector).removeAttribute("disabled")
}

export function disable(selector) {
    $(selector).setAttribute("disabled", true)
}

export function buildAddress(address) {
    let text = []
    if ("pesonal" in address) {
        text.push(address.personal)
    }
    if ("address" in address) {
        if (text.length > 0) {
            text.push(" ")
        }
        text.push(buildElement("a", "address", "<", address.address, ">"))
    }

    return buildElement("span", "address", text)
}

export function buildTable(headers, tbody) {
    const thead = buildElement("thead")
    for (let i = 0; i < headers.length; i += 1) {
        thead.appendChild(buildElement("th", undefined, headers[i]))
    }

    return buildElement("table", undefined, thead, tbody)
}

export function buildControls(...controls) {
    return append(
        buildFragment(),
        controls.map(c => buildCommand(c.command, c.label))
    )
}

export function errorView(...message) {
    return {
        content: buildElement("div", "error", ...message)
    }
}

export function encodeCommand(subsystem, param) {
    if ("s" in param) {
        console.warn("Subsystem overlap")
    }
    param.s = subsystem
    const result = []
    for (let k in param) {
        const v = param[k]
        if (v !== undefined) {
            result.push(k + "=" + v)
        }
    }
    return result.join("&")
}

export function getText(el) {
    el.normalize()
    if (el !== null && el.firstChild !== null && el.firstChild.nodeType === Node.TEXT_NODE) {
        return el.firstChild.nodeValue
    }
    return undefined
}

export function buildModal(options) {
    const buttons = Array.isArray(options.buttons) ? options.buttons : [options.buttons]
    buttons.unshift("Cancel")

    return new Promise((resolve, reject) => {
        $("body").classList.add("noscroll")
        const modal = buildElement("div", "dialog-holder",
            buildElement("div", "dialog",
                buildElement("form", undefined, buildElement("h2", "dialog-title", options.title),
                    buildElement("div", "dialog-body", options.content),
                    buildElement("div", "dialog-footer",
                        buttons.map(b => buildElement("button", {
                            type: "button"
                        }, b))
                    )
                )
            )
        )

        on("click", ".dialog button", function (e) {
            $("body").classList.remove("noscroll")
            fade("out", "fast", modal).then(m => m.parentNode.removeChild(modal))
            resolve(modal)
        })
        if ("beforeshow" in options) {
            options.beforeshow(modal)
        }

        $("body").appendChild(modal)
        fade("in", "fast", modal)
    })
}

export function setCommand(hash) {
    window.location.hash = hash
}

export const backend = (function () {
    const worker = new SharedWorker("worker.js", {
        name: 'socket',
        type: 'module'
    })
    const queue = {}

    function _nextId() {
        const a = new Int32Array(1)
        crypto.getRandomValues(a)
        return a[0]
    }

    function _send(msg) {
        return new Promise((resolve, reject) => {
            msg._seq = _nextId()

            queue[msg._seq] = {
                resolve: resolve,
                reject: reject
            }

            console.log("SW: sending message: ", msg)
            worker.port.postMessage(msg)
        })
    }

    worker.port.onmessage = function (e) {
        const msg = e.data;
        console.log("SW: received message: ", msg)
        const q = queue[msg._seq]
        delete queue[msg._seq]
        if (q !== undefined) {

            if ("success" in msg) {
                q.resolve(msg.success)
            } else {
                q.reject(msg.error)
            }

        } else {
            console.warn("Unexpected message from shared worker: ", msg)
        }
    }

    worker.port.start()

    return {
        send: _send
    }
})()

export class Address {
    constructor(a) {
        this.address = a.address;
        this.name = a.personal;
    }

    get link() {
        return buildElement("span", undefined, this.hasName ? this.name : this.address)
    }

    get hasName() {
        return this.name !== undefined
    }
}

export class AddressList {
    constructor(l) {
        if (Array.isArray(l)) {
            this.addreses = l.map(a => new Address(a))
        } else {
            this.addreses = [new Address(l)]
        }
    }

    get display() {
        return this.addreses.reduce((a, c, i) => {
            if (i > 0) {
                a.appendChild(textNode(", "))
            }
            a.appendChild(c.link)
            return a
        }, buildFragment())
    }
}
