// Licensed under the MIT License
// https://github.com/craigahobbs/element-model/blob/main/LICENSE

import {renderElements, renderElementsToString, validateElements} from '../lib/elementModel.js';
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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
            'name': 'ElementModelValidationError',
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


test('renderElements, attr undefined value', () => {
    const {window} = new JSDOM();
    const {document} = window;
    const elements = {'html': 'div', 'attr': {'id': undefined}};
    assert.equal(validateElements(elements), elements);
    renderElements(document.body, elements);
    assert.equal(
        document.body.innerHTML,
        '<div id="undefined"></div>'
    );
});


//
// renderElementsToString tests
//


test('renderElementsToString, null', () => {
    assert.equal(renderElementsToString(null), '');
});


test('renderElementsToString, empty array', () => {
    assert.equal(renderElementsToString([]), '');
});


test('renderElementsToString, text', () => {
    assert.equal(renderElementsToString({'text': 'Hello'}), 'Hello');
});


test('renderElementsToString, text escape', () => {
    assert.equal(renderElementsToString({'text': '<&>"\''}), '&lt;&amp;&gt;&quot;&#039;');
});


test('renderElementsToString, simple html', () => {
    assert.equal(renderElementsToString({'html': 'div'}), '<div></div>');
});


test('renderElementsToString, html with attr', () => {
    assert.equal(renderElementsToString({'html': 'div', 'attr': {'id': 'foo', 'class': 'bar'}}), '<div id="foo" class="bar"></div>');
});


test('renderElementsToString, attr escape', () => {
    assert.equal(renderElementsToString({'html': 'div', 'attr': {'title': '"&"'}}), '<div title="&quot;&amp;&quot;"></div>');
});


test('renderElementsToString, attr null value', () => {
    assert.equal(renderElementsToString({'html': 'div', 'attr': {'id': null}}), '<div></div>');
});


test('renderElementsToString, attr null', () => {
    assert.equal(renderElementsToString({'html': 'div', 'attr': null}), '<div></div>');
});


test('renderElementsToString, html with children', () => {
    assert.equal(renderElementsToString({'html': 'div', 'elem': {'text': 'Hello'}}), '<div>Hello</div>');
});


test('renderElementsToString, array', () => {
    assert.equal(
        renderElementsToString([{'html': 'p', 'elem': {'text': 'One'}}, {'html': 'p', 'elem': {'text': 'Two'}}]),
        '<p>One</p><p>Two</p>'
    );
});


test('renderElementsToString, svg', () => {
    assert.equal(renderElementsToString({'svg': 'svg'}), '<svg></svg>');
});


test('renderElementsToString, void', () => {
    assert.equal(renderElementsToString({'html': 'br'}), '<br />');
});


test('renderElementsToString, void with children', () => {
    assert.equal(renderElementsToString({'html': 'br', 'elem': {'text': 'no'}}), '<br />');
});


test('renderElementsToString, ignore callback', () => {
    assert.equal(renderElementsToString({'html': 'div', 'callback': null}), '<div></div>');
});


test('renderElementsToString, non-string attr value', () => {
    assert.equal(renderElementsToString({'html': 'span', 'attr': {'style': 0}}), '<span style="0"></span>');
});


test('renderElementsToString, basic', () => {
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
    assert.equal(
        renderElementsToString(elements),
        '<h1>Hello, World!</h1><p>Word</p><p>TwoWords</p><p></p><p></p><div id="Id"></div>'
    );
});


test('renderElementsToString, complex', () => {
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
    assert.equal(
        renderElementsToString(elements),
        '<html><h1>Title</h1><p>This is some <span style="font-weight: bold;">bolded text!</span></p><hr /></html>'
    );
});


test('renderElementsToString, svg complex', () => {
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
    assert.equal(
        renderElementsToString(elements),
        '<svg width="600" height="400">' +
            '<rect x="10" y="10" width="20" height="20" style="fill: #ff0000;"></rect>' +
            '<rect x="10" y="10" width="20" height="20" style="fill: #00ff00;"></rect>' +
            '</svg>'
    );
});


test('renderElementsToString, indent number', () => {
    const elements = {'html': 'div', 'elem': {'text': 'Hello'}};
    assert.equal(renderElementsToString(elements, 2), '<div>\n  Hello\n</div>\n');
});


test('renderElementsToString, indent string', () => {
    const elements = {'html': 'div', 'elem': {'text': 'Hello'}};
    assert.equal(renderElementsToString(elements, '\t'), '<div>\n\tHello\n</div>\n');
});


test('renderElementsToString, indent null', () => {
    const elements = {'html': 'div', 'elem': {'text': 'Hello'}};
    assert.equal(renderElementsToString(elements, null), '<div>Hello</div>');
});


test('renderElementsToString, indent undefined', () => {
    const elements = {'html': 'div', 'elem': {'text': 'Hello'}};
    assert.equal(renderElementsToString(elements, undefined), '<div>Hello</div>');
});


test('renderElementsToString, indent complex', () => {
    const elements = {
        'html': 'html',
        'elem': [
            {'html': 'h1', 'elem': {'text': 'Title'}},
            {
                'html': 'p',
                'elem': [
                    {'text': 'This is some '},
                    {'html': 'span', 'attr': {'style': 'font-weight: bold;'}, 'elem': {'text': 'bolded text!'}}
                ]
            }
        ]
    };
    assert.equal(
        renderElementsToString(elements, 2),
        `\
<html>
  <h1>
    Title
  </h1>
  <p>
    This is some 
    <span style="font-weight: bold;">
      bolded text!
    </span>
  </p>
</html>
`
    );
});


test('renderElementsToString, indent void', () => {
    const elements = {'html': 'br'};
    assert.equal(renderElementsToString(elements, 2), '<br />\n');
});


test('renderElementsToString, indent invalid', () => {
    const elements = {'html': 'div'};
    assert.equal(renderElementsToString(elements, {}), '<div></div>');
});


test('renderElementsToString, indent negative number', () => {
    const elements = {'html': 'div', 'elem': {'text': 'Hello'}};
    assert.equal(renderElementsToString(elements, -1), '<div>Hello</div>');
});


test('renderElementsToString, indent zero', () => {
    const elements = {'html': 'div', 'elem': {'text': 'Hello'}};
    assert.equal(renderElementsToString(elements, 0), '<div>Hello</div>');
});


test('renderElementsToString, attr undefined value', () => {
    assert.equal(renderElementsToString({'html': 'div', 'attr': {'id': undefined}}), '<div id="undefined"></div>');
});


test('renderElementsToString, text no special chars', () => {
    assert.equal(renderElementsToString({'text': 'hello world 123'}), 'hello world 123');
});
