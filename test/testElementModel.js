// Licensed under the MIT License
// https://github.com/craigahobbs/element-model/blob/main/LICENSE

import {renderElements, validateElements} from '../lib/elementModel.js';
import {JSDOM} from 'jsdom/lib/api.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


//
// validateElements tests
//


test('validateElements', () => {
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
    assert.equal(validateElements(elements), elements);
});


test('validateElements, callback null', () => {
    const elements = {'html': 'html', 'callback': null};
    assert.equal(validateElements(elements), elements);
});


test('validateElements, error missing element member', () => {
    const elements = {};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': "Missing element member {} (type 'object')"
        }
    );
});


test('validateElements, error multiple element members', () => {
    const elements = {'html': 'html', 'svg': 'svg'};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': 'Multiple element members html,svg {"html":"html","svg":"svg"} (type \'object\')'
        }
    );
});


test('validateElements, error unknown member', () => {
    const elements = {'html': 'html', 'unknown': 'abc'};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': "Unknown element member 'unknown'"
        }
    );
});


test('validateElements, error html length', () => {
    const elements = {'html': ''};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': 'Invalid html tag "" (type \'string\')'
        }
    );
});


test('validateElements, error html type', () => {
    const elements = {'html': 0};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': "Invalid html tag 0 (type 'number')"
        }
    );
});


test('validateElements, error svg length', () => {
    const elements = {'svg': ''};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': 'Invalid svg tag "" (type \'string\')'
        }
    );
});


test('validateElements, error svg type', () => {
    const elements = {'svg': 0};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': "Invalid svg tag 0 (type 'number')"
        }
    );
});


test('validateElements, error text type', () => {
    const elements = {'text': 0};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': "Invalid text tag 0 (type 'number')"
        }
    );
});


test('validateElements, error attr type', () => {
    const elements = {'html': 'html', 'attr': 0};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': "Invalid attributes 0 (type 'number')"
        }
    );
});


test('validateElements, error attr text element', () => {
    const elements = {'text': 'abc', 'attr': null};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': 'Invalid member "attr" for text element "abc" (type \'string\')'
        }
    );
});


test('validateElements, error elem type', () => {
    const elements = {'html': 'html', 'elem': [0]};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': "Invalid element 0 (type 'number')"
        }
    );
});


test('validateElements, error elem text element', () => {
    const elements = {'text': 'abc', 'elem': null};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': 'Invalid member "elem" for text element "abc" (type \'string\')'
        }
    );
});


test('validateElements, error callback invalid value', () => {
    const elements = {'html': 'html', 'callback': 0};
    assert.throws(
        () => {
            validateElements(elements);
        },
        {
            'name': 'Error',
            'message': "Invalid element callback function 0 (type 'number')"
        }
    );
});


//
// renderElements tests
//


test('renderElements', () => {
    const {window} = new JSDOM();
    const {document} = window;

    document.body.innerHTML = '';
    renderElements(document.body, {'html': 'div'});
    assert.equal(document.body.innerHTML, '<div></div>');

    renderElements(document.body, [{'html': 'div'}, {'html': 'div', 'attr': {'id': 'Id'}}]);
    assert.equal(document.body.innerHTML, '<div></div><div id="Id"></div>');

    renderElements(document.body, {'html': 'div'}, false);
    assert.equal(document.body.innerHTML, '<div></div><div id="Id"></div><div></div>');

    renderElements(document.body, null);
    assert.equal(document.body.innerHTML, '');

    renderElements(document.body);
    assert.equal(document.body.innerHTML, '');
});


test('renderElements, basic', () => {
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
    assert.equal(validateElements(elements), elements);
    renderElements(document.body, elements);
    assert.equal(
        document.body.innerHTML,
        '<h1>Hello, World!</h1><p>Word</p><p>TwoWords</p><p></p><p></p><div id="Id"></div>'
    );
});


test('renderElements, non-string attribute value', () => {
    const {window} = new JSDOM();
    const {document} = window;
    const elements = {'html': 'span', 'attr': {'style': 0}};
    assert.equal(validateElements(elements), elements);
    renderElements(document.body, elements);
    assert.equal(
        document.body.innerHTML,
        '<span style="0"></span>'
    );
});


test('renderElements, svg', () => {
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
    assert.equal(validateElements(elements), elements);
    renderElements(document.body, elements);
    assert.equal(
        document.body.innerHTML,
        '<svg width="600" height="400">' +
            '<rect x="10" y="10" width="20" height="20" style="fill: #ff0000;"></rect>' +
            '<rect x="10" y="10" width="20" height="20" style="fill: #00ff00;"></rect>' +
            '</svg>'
    );
});


test('renderElements, element callback', () => {
    const {window} = new JSDOM();
    const {document} = window;

    let callbackCount = 0;
    const callback = (element) => {
        assert.equal(typeof element !== 'undefined', true);
        callbackCount += 1;
    };

    const elements = {'html': 'div', 'callback': callback};
    assert.equal(validateElements(elements), elements);
    renderElements(document.body, elements);
    assert.equal(
        document.body.innerHTML,
        '<div></div>'
    );
    assert.equal(callbackCount, 1);
});


test('renderElements, element callback null', () => {
    const {window} = new JSDOM();
    const {document} = window;

    const elements = {'html': 'div', 'callback': null};
    assert.equal(validateElements(elements), elements);
    renderElements(document.body, elements);
    assert.equal(
        document.body.innerHTML,
        '<div></div>'
    );
});
