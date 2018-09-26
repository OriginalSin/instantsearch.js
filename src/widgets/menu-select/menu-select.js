import React, { render } from 'preact-compat';
import cx from 'classnames';

import connectMenu from '../../connectors/menu/connectMenu';
import defaultTemplates from './defaultTemplates';
import MenuSelect from '../../components/MenuSelect';

import { prepareTemplateProps, getContainerNode } from '../../lib/utils';

import { component } from '../../lib/suit';

const suit = component('MenuSelect');

const renderer = ({
  containerNode,
  cssClasses,
  renderState,
  templates,
  transformData,
}) => (
  { refine, items, canRefine, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  render(
    <MenuSelect
      cssClasses={cssClasses}
      items={items}
      refine={refine}
      templateProps={renderState.templateProps}
      canRefine={canRefine}
    />,
    containerNode
  );
};

const usage = `Usage:
menuSelect({
  container,
  attribute,
  [ sortBy=['name:asc'] ],
  [ limit=10 ],
  [ cssClasses.{root, noRefinementRoot, select, option} ]
  [ templates.{item,seeAllOptions} ],
  [ transformData.{item} ],
  [ transformItems ]
})`;

/**
 * @typedef {Object} MenuSelectCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [noRefinementRoot] CSS class to add to the root when there are no items to display
 * @property {string|string[]} [select] CSS class to add to the select element.
 * @property {string|string[]} [option] CSS class to add to the option element.
 *
 */

/**
 * @typedef {Object} MenuSelectTemplates
 * @property {string|function(label: string, count: number, isRefined: boolean, value: string)} [item] Item template, provided with `label`, `count`, `isRefined` and `value` data properties.
 * @property {string} [seeAllOptions='See all'] Label of the see all option in the select.
 */

/**
 * @typedef {Object} MenuSelectTransforms
 * @property {function} [item] Method to change the object passed to the `item` template.
 */

/**
 * @typedef {Object} MenuSelectWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attribute Name of the attribute for faceting
 * @property {string[]|function} [sortBy=['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {MenuSelectTemplates} [templates] Customize the output through templating.
 * @property {number} [limit=10] How many facets values to retrieve.
 * @property {MenuSelectTransforms} [transformData] Set of functions to update the data before passing them to the templates.
 * @property {MenuSelectCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * Create a menu select out of a facet
 * @type {WidgetFactory}
 * @category filter
 * @param {MenuSelectWidgetOptions} $0 The Menu select widget options.
 * @return {Widget} Creates a new instance of the Menu select widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.menuSelect({
 *     container: '#categories-menuSelect',
 *     attribute: 'hierarchicalCategories.lvl0',
 *     limit: 10,
 *   })
 * );
 */
export default function menuSelect({
  container,
  attribute,
  sortBy = ['name:asc'],
  limit = 10,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformData,
  transformItems,
}) {
  if (!container || !attribute) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    noRefinementRoot: cx(
      suit({ modifierName: 'noRefinement' }),
      userCssClasses.noRefinementRoot
    ),
    select: cx(suit({ descendantName: 'select' }), userCssClasses.select),
    option: cx(suit({ descendantName: 'option' }), userCssClasses.option),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
    transformData,
  });

  try {
    const makeWidget = connectMenu(specializedRenderer);
    return makeWidget({ attribute, limit, sortBy, transformItems });
  } catch (e) {
    throw new Error(usage);
  }
}