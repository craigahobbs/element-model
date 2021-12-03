// Licensed under the MIT License
// https://github.com/craigahobbs/element-model/blob/main/LICENSE

/* eslint-disable id-length */

import {renderElements, validateElements} from '../lib/elementModel.js';
import {JSDOM} from 'jsdom/lib/api.js';
import test from 'ava';


//
// validateElements tests
//

test('validateElements', (t) => {
    const elements = {
        'html': 'html',
        'elem': [
            {'html': 'h1', 'elem': {'text': 'Title'}},
            {
                'html': 'p',
                'attr': null,
                'elem': [
                    {'text': 'This is some '},
                    {'text': ''},
                    {'html': 'span', 'attr': {'style': 'font-weight: bold;'}, 'elem': {'text': 'bolded text!'}}
                ]
            },
            {'html': 'hr', 'elem': null}
        ]
    };
    t.is(validateElements(elements), elements);
});


test('validateElements, error missing element member', (t) => {
    const elements = {};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Missing element member {} (type 'object')");
});


test('validateElements, error multiple element members', (t) => {
    const elements = {'html': 'html', 'svg': 'svg'};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Multiple element members html,svg {"html":"html","svg":"svg"} (type \'object\')');
});


test('validateElements, error unknown member', (t) => {
    const elements = {'html': 'html', 'unknown': 'abc'};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Unknown element member 'unknown'");
});


test('validateElements, error html length', (t) => {
    const elements = {'html': ''};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Invalid html tag "" (type \'string\')');
});


test('validateElements, error html type', (t) => {
    const elements = {'html': 0};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid html tag 0 (type 'number')");
});


test('validateElements, error svg length', (t) => {
    const elements = {'svg': ''};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Invalid svg tag "" (type \'string\')');
});


test('validateElements, error svg type', (t) => {
    const elements = {'svg': 0};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid svg tag 0 (type 'number')");
});


test('validateElements, error text type', (t) => {
    const elements = {'text': 0};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid text tag 0 (type 'number')");
});


test('validateElements, error attr type', (t) => {
    const elements = {'html': 'html', 'attr': 0};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid attributes 0 (type 'number')");
});


test('validateElements, error attr text element', (t) => {
    const elements = {'text': 'abc', 'attr': null};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Invalid member "attr" for text element "abc" (type \'string\')');
});


test('validateElements, error elem type', (t) => {
    const elements = {'html': 'html', 'elem': [0]};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid element 0 (type 'number')");
});


test('validateElements, error elem text element', (t) => {
    const elements = {'text': 'abc', 'elem': null};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Invalid member "elem" for text element "abc" (type \'string\')');
});


test('validateElements, error callback null value', (t) => {
    const elements = {'html': 'html', 'callback': null};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid element callback function null (type 'object')");
});


test('validateElements, error callback invalid value', (t) => {
    const elements = {'html': 'html', 'callback': 0};
    let errorMessage = null;
    try {
        validateElements(elements);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, "Invalid element callback function 0 (type 'number')");
});


//
// renderElements tests
//

test('renderElements', (t) => {
    const {window} = new JSDOM();
    const {document} = window;

    document.body.innerHTML = '';
    renderElements(document.body, {'html': 'div'});
    t.is(document.body.innerHTML, '<div></div>');

    renderElements(document.body, [{'html': 'div'}, {'html': 'div', 'attr': {'id': 'Id'}}]);
    t.is(document.body.innerHTML, '<div></div><div id="Id"></div>');

    renderElements(document.body, {'html': 'div'}, false);
    t.is(document.body.innerHTML, '<div></div><div id="Id"></div><div></div>');

    renderElements(document.body, null);
    t.is(document.body.innerHTML, '');

    renderElements(document.body);
    t.is(document.body.innerHTML, '');
});


test('renderElements, basic', (t) => {
    const {window} = new JSDOM();
    const {document} = window;
    const elements = [
        {'html': 'h1', 'elem': {'text': 'Hello, World!'}},
        [
            {'html': 'p', 'elem': [{'text': 'Word'}]},
            {'html': 'p', 'elem': [{'text': 'Two'}, {'text': 'Words'}]},
            {'html': 'p', 'elem': []},
            {'html': 'p', 'elem': null}
        ],
        {'html': 'div', 'attr': {'id': 'Id', 'class': null}}
    ];
    t.is(validateElements(elements), elements);
    renderElements(document.body, elements);
    t.is(
        document.body.innerHTML,
        '<h1>Hello, World!</h1><p>Word</p><p>TwoWords</p><p></p><p></p><div id="Id"></div>'
    );
});


test('renderElements, non-string attribute value', (t) => {
    const {window} = new JSDOM();
    const {document} = window;
    const elements = {'html': 'span', 'attr': {'style': 0}};
    t.is(validateElements(elements), elements);
    renderElements(document.body, elements);
    t.is(
        document.body.innerHTML,
        '<span style="0"></span>'
    );
});


test('renderElements, svg', (t) => {
    const {window} = new JSDOM();
    const {document} = window;
    const elements = [
        {'svg': 'svg', 'attr': {'width': '600', 'height': '400'}, 'elem': [
            {
                'svg': 'rect',
                'attr': {'x': '10', 'y': '10', 'width': '20', 'height': '20', 'style': 'fill: #ff0000;'}
            },
            {
                'svg': 'rect',
                'attr': {'x': '10', 'y': '10', 'width': '20', 'height': '20', 'style': 'fill: #00ff00;'}
            }
        ]}
    ];
    t.is(validateElements(elements), elements);
    renderElements(document.body, elements);
    t.is(
        document.body.innerHTML,
        '<svg width="600" height="400">' +
            '<rect x="10" y="10" width="20" height="20" style="fill: #ff0000;"></rect>' +
            '<rect x="10" y="10" width="20" height="20" style="fill: #00ff00;"></rect>' +
            '</svg>'
    );
});


test('renderElements, element callback', (t) => {
    const {window} = new JSDOM();
    const {document} = window;

    let callbackCount = 0;
    const callback = (element) => {
        t.true(typeof element !== 'undefined');
        callbackCount += 1;
    };

    const elements = {'html': 'div', 'callback': callback};
    t.is(validateElements(elements), elements);
    renderElements(document.body, elements);
    t.is(
        document.body.innerHTML,
        '<div></div>'
    );
    t.is(callbackCount, 1);
});
