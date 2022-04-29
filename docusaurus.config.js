// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '倚码千言',
  tagline: 'Dinosaurs are cool',  // 网站标语
  url: 'https://codethousand.cn',
  baseUrl: '/myblog/',
  onBrokenLinks: 'warn',  // Docusaurus 在检测到无效链接时的行为
  onBrokenMarkdownLinks: 'warn',  // Docusaurus 在检测到无效 Markdown 链接时的行为
  favicon: 'img/favicon.ico',
  organizationName: 'anchem', // Usually your GitHub org/user name.
  projectName: 'blog', // Usually your repo name.
  deploymentBranch: 'master',
  trailingSlash: false,
  noIndex: false,  // 设置为false表示告知搜索引擎不要索引您的站点
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
        hideOnScroll: true,  // 滚动时自动隐藏导航栏
        items: [
          {
            to: 'docs/softwaremaster',
            label: '软件大师之路',
            position: 'left'
          },
          // {to: '/blog', label: '博文', position: 'left'},
          {to: '/about', label: '关于', position: 'left'},
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
                to: 'docs/softwaremaster',
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
                label: '关于',
                to: 'about',
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