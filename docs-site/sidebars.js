/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction'
    },
    {
      type: 'doc',
      id: 'install',
      label: 'Installation'
    },
    {
      type: 'doc',
      id: 'concepts',
      label: 'Core Concepts'
    },
    {
      type: 'category',
      label: 'Core Package',
      items: [
        {
          type: 'doc',
          id: 'core/readme',
          label: 'Overview'
        },
        {
          type: 'doc',
          id: 'core/reference',
          label: 'API Reference'
        }
      ],
    },
    {
      type: 'category',
      label: 'React Package',
      items: [
        {
          type: 'doc',
          id: 'react/readme',
          label: 'Overview'
        },
        {
          type: 'doc',
          id: 'react/reference',
          label: 'API Reference'
        },
        {
          type: 'doc',
          id: 'react/custom',
          label: 'Custom Components'
        },
        {
          type: 'doc',
          id: 'react/messages',
          label: 'Built-in Messages'
        },
        {
          type: 'doc',
          id: 'react/actions',
          label: 'Built-in Actions'
        },
        {
          type: 'doc',
          id: 'react/styling',
          label: 'Styling Guide'
        },
        {
          type: 'doc',
          id: 'react/typescript',
          label: 'TypeScript Guide'
        }
      ],
    },
    {
      type: 'doc',
      id: 'plugins',
      label: 'Plugins'
    },
    {
      type: 'doc',
      id: 'typescript',
      label: 'Core TypeScript'
    },
    {
      type: 'doc',
      id: 'advanced-examples',
      label: 'Advanced Examples'
    },
    {
      type: 'doc',
      id: 'error-handling',
      label: 'Error Handling'
    },
    {
      type: 'doc',
      id: 'gotchas',
      label: 'Common Issues'
    }
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

module.exports = sidebars;
