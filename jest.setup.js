import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
const {
    JSDOM
} = require('jsdom');
Enzyme.configure({
    adapter: new Adapter()
});
Object.defineProperty(global, 'Node', {
    value: {
        firstElementChild: 'firstElementChild'
    }
})
const jsdom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: "http://localhost"
});
const {
    window
} = jsdom;

function copyProps(src, target) {
    Object.defineProperties(target, {
        ...Object.getOwnPropertyDescriptors(src),
        ...Object.getOwnPropertyDescriptors(target),
    });
}

global.window = window;
global.document = window.document;
global.navigator = {
    userAgent: 'node.js',
};
global.requestAnimationFrame = function (callback) {
    return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
    clearTimeout(id);
};
copyProps(window, global);