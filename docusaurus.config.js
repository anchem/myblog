// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '倚码千言',
  tagline: 'Dinosaurs are cool',
  url: 'https://codethousand.cn',
  baseUrl: '/blog/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'anchem', // Usually your GitHub org/user name.
  projectName: 'blog', // Usually your repo name.
  deploymentBranch: 'master',
  trailingSlash: false,
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
        title: '倚码千言',
        logo: {
          alt: '倚码千言 Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'softwaremaster/main',
            position: 'left',
            label: '软件大师之路',
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: '阿不成长树',
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: '个人成长之旅',
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: '通识知识',
          },
          {to: '/blog', label: '博文', position: 'left'},
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: '关于',
          },
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          }
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '主题',
            items: [
              {
                label: '软件大师之路',
                to: 'softwaremaster/main',
              }
            ],
          },
          {
            title: '项目',
            items: [
              {
                label: '高质量软件工作手册',
                href: 'https://codethousand.cn/workbook/#/',
              }
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/anchem',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 倚码千言, Inc. 采用 Docusaurus 构建.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
