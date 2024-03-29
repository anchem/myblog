// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '倚码千言',
  tagline: 'Hakcerleon\'s Website',  // 网站标语
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
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN']
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js')
        },
        blog: {
          showReadingTime: true,
          postsPerPage: 10,
          blogSidebarCount: 'ALL',
          blogSidebarTitle: '所有文章',
          readingTime: ({content, frontMatter, defaultReadingTime}) =>
            defaultReadingTime({content, options: {wordsPerMinute: 300}}),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        }
      })
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
          {
            to: 'docs/growthtree',
            label: '阿不成长树',
            position: 'left'
          },
          {to: '/blog', label: '随笔', position: 'left'},
          {to: '/about', label: '关于', position: 'right'}
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
              },
              {
                label: '阿不成长树',
                to: 'docs/growthtree',
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
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['java', 'markdown', 'c', 'python', 'bash', 'git', 'sql'],
      },
    }),
};

module.exports = config;
