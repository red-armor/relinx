// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Relinx',
  tagline: 'Relinx are cool',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/relinx/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Relinx',
        logo: {
          alt: 'Relinx Logo',
          src: 'img/logo.svg',
          href: '/docs/introduction/getting-started',
        },
        items: [
          // {
          //   type: 'doc',
          //   docId: 'introduction/getting-started',
          //   position: 'left',
          //   label: 'Tutorial',
          // },
          {
            label: 'docs',
            position: 'right',
            items: [{
              label: 'armor',
              href: 'https://fe-docs.devops.xiaohongshu.com/armor/docs/introduction/getting-started',
            }, {
            //   label: 'relinx',
            //   href: 'https://fe-docs.devops.xiaohongshu.com/relinx/docs/introduction/getting-started',
            // }, {
              label: 'halation',
              href: 'https://fe-docs.devops.xiaohongshu.com/halation/docs/introduction/getting-started',
            }, {
              label: 'xswr',
              href: 'https://fe-docs.devops.xiaohongshu.com/xswr/docs/introduction/getting-started',
            }, {
              label: 'state-tracker',
              href: 'https://fe-docs.devops.xiaohongshu.com/state-tracker/docs/introduction/getting-started',
            }],
          },
          // { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://code.devops.xiaohongshu.com/fe/infra/halation',
            label: 'GitLab',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              // {
              //   label: 'Tutorial',
              //   to: '/docs/introduction/getting-started',
              // },
              {
                label: 'Ecom',
                to: 'https://fe-docs.devops.xiaohongshu.com/e-com/docs/introduction/getting-started',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'markdown feature',
                to: 'https://docusaurus.io/docs/markdown-features',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Relinx, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
