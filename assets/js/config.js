/**
 * ============================================================
 *  站点配置 · 改这一个文件就能换成自己的学校
 * ============================================================
 *  1. 修改 meta / brand / theme / contact
 *  2. 修改 nav 调整导航
 *  3. 修改 pages 调整每个页面的标题与介绍
 *  4. 新闻、公告、师资等列表内容在 data/*.json
 *  5. 接入后端时填写 api.base 与 ai.endpoint
 *
 *  提示：本站默认是纯静态的演示数据，可直接部署到
 *  GitHub Pages / Cloudflare Pages / 任意静态托管。
 */
window.SITE_CONFIG = {
  meta: {
    siteName: '青禾中学',
    shortName: '青禾',
    englishName: 'Qinghe High School',
    slogan: '向光生长 · 逐梦而行',
    sloganEn: 'Grow Toward the Light',
    description:
      '青禾中学官方网站模板：学校简介、新闻动态、公告通知、师资力量、校园风光、学子风采、招生信息与校长信箱。',
    keywords: ['青禾中学', '学校官网', '校园网站', '招生简章', '校园新闻'],
    locale: 'zh-CN',
    url: 'https://example.com',
    ogImage: 'assets/img/og-cover.png',
    founded: '2015',
    type: '公办高中',
  },

  brand: {
    logo: 'assets/img/logo.svg',
    logoAlt: '青禾中学校徽',
  },

  // 只需改这三个颜色，全站主色会自动生成深浅色阶
  theme: {
    primary: '#1e40af',
    primaryDark: '#1e3a8a',
    accent: '#06b6d4',
  },

  contact: {
    address: '示例省示例市青禾区学府路 1 号',
    phone: '000-0000-0000',
    email: 'hello@example.com',
    officeHours: '周一至周五 8:00 - 17:00',
    mapUrl: '',
  },

  nav: [
    { label: '首页', href: 'index.html', key: 'home' },
    {
      label: '走进青禾',
      key: 'about',
      children: [
        { label: '学校简介', href: 'about.html', key: 'about' },
        { label: '学校故事', href: 'story.html', key: 'story' },
      ],
    },
    { label: '公告通知', href: 'announcements.html', key: 'announcements' },
    { label: '新闻动态', href: 'news.html', key: 'news' },
    { label: '师资力量', href: 'teachers.html', key: 'teachers' },
    { label: '校园风光', href: 'gallery.html', key: 'gallery' },
    { label: '学子风采', href: 'students.html', key: 'students' },
    { label: '招生简章', href: 'admission.html', key: 'admission' },
  ],

  footer: {
    quickLinks: [
      { label: '学校简介', href: 'about.html' },
      { label: '学校故事', href: 'story.html' },
      { label: '公告通知', href: 'announcements.html' },
      { label: '新闻动态', href: 'news.html' },
      { label: '师资力量', href: 'teachers.html' },
      { label: '招生简章', href: 'admission.html' },
      { label: '校长信箱', href: 'mailbox.html' },
      { label: '更新日志', href: 'changelog.html' },
    ],
    icp: '',
    copyright: '',
  },

  hero: {
    badge: '一所有温度的学校',
    titleLines: ['向光生长', '逐梦而行'],
    divider: '·',
    subtitleEn: 'Grow Toward the Light · Learn with Purpose',
    subtitleCn: '青禾中学 · 让每个孩子都被看见',
    actions: [
      { label: '探索校园', href: 'about.html', style: 'primary' },
      { label: '招生简章', href: 'admission.html', style: 'ghost' },
    ],
    stats: [
      { value: 2015, label: '建校年份', suffix: '', plain: true },
      { value: 120, label: '占地面积（亩）', suffix: '+' },
      { value: 2400, label: '在校学生', suffix: '+' },
      { value: 78.6, label: '本科上线率', suffix: '%', decimal: true },
    ],
  },

  stats: {
    about: [
      { value: 2015, label: '建校时间', suffix: '年', plain: true },
      { value: 120, label: '占地面积（亩）', suffix: '+' },
      { value: 2400, label: '在校学生', suffix: '+' },
      { value: 78.6, label: '本科上线率', suffix: '%', decimal: true },
    ],
    teachers: [
      { value: 160, label: '专任教师', suffix: '+ 名' },
      { value: 48, label: '高级教师', suffix: '+ 名' },
      { value: 72, label: '硕士及以上', suffix: '+ 名' },
      { value: 100, label: '本科及以上学历', suffix: '%' },
    ],
    students: [
      { value: 60, label: '省市级奖项', suffix: '+ 项' },
      { value: 24, label: '学生社团', suffix: '+ 个' },
      { value: 800, label: '注册志愿者', suffix: '+ 名' },
      { value: 120, label: '年度校园活动', suffix: '+ 场' },
    ],
    admission: [
      { value: 2400, label: '在校学生', suffix: '+' },
      { value: 78.6, label: '本科上线率', suffix: '%', decimal: true },
      { value: 120, label: '占地面积（亩）', suffix: '+' },
      { value: 160, label: '专任教师', suffix: '+' },
    ],
  },

  // 首页六个办学特色卡片
  features: [
    {
      icon: 'book',
      title: '小班化教学',
      desc: '关注每一个孩子的学习节奏，让课堂真正发生对话与思考。',
    },
    {
      icon: 'users',
      title: '成长导师制',
      desc: '每位学生都有一位成长导师，负责学业规划、心理支持与家校沟通。',
    },
    {
      icon: 'chart',
      title: '数据驱动教研',
      desc: '基于学情数据开展精准教研，让每一次练习都更有针对性。',
    },
    {
      icon: 'building',
      title: '现代化校园',
      desc: '智慧教室、开放图书馆、创客空间与标准化运动场一应俱全。',
    },
    {
      icon: 'heart',
      title: '全人教育',
      desc: '体育、艺术、劳动与志愿服务共同构成学生的成长底色。',
    },
    {
      icon: 'globe',
      title: '开放视野',
      desc: '通过校际交流、研学实践与国际理解课程，打开看世界的窗口。',
    },
  ],

  about: {
    tag: 'About Us',
    titleHtml: '学校<span class="accent">简介</span>',
    subtitle: '一所以学生成长为中心的现代学校',
    paragraphs: [
      '青禾中学创办于 2015 年，是一所公办全日制高中。学校坐落于示例市青禾区，校园占地 120 余亩，现有在校学生 2400 余人、专任教师 160 余人。',
      '学校坚持“向光生长，逐梦而行”的办学理念，以“诚朴、笃学、担当、创新”为校训，致力于培养身心健康、思维开阔、勇于担当的时代青年。',
      '近年来，学校围绕课堂改进、教师发展和学生支持三条主线持续投入，形成了小班化教学、成长导师制、学情数据教研等办学特色。',
    ],
    image: 'assets/img/about-campus.svg',
    imageAlt: '校园全景示意图',
    detailTitle: '让教育回归人的成长',
    detailParagraphs: [
      '我们相信，教育不是把所有人培养成同一个样子，而是帮助每个孩子找到自己的方向。学校通过分层课程、社团活动和个别化辅导，为不同基础、不同兴趣的学生提供可选择的成长路径。',
      '课堂之外，学校设有 24 个学生社团、每年 120 余场校园活动，并与多所高校、科研机构和社会组织建立合作，让学生在实践中理解知识、认识社会。',
      '学校同时重视教师的专业成长，通过名师工作室、青年教师成长营和跨学科教研，让教师成为终身学习者。',
    ],
    values: [
      { icon: '🌱', title: '尊重差异', desc: '承认每个孩子不同的起点与节奏' },
      { icon: '🤝', title: '彼此成就', desc: '师生、家校、社区共同参与成长' },
      { icon: '🧭', title: '面向未来', desc: '培养可迁移的能力与终身学习习惯' },
    ],
    motto: {
      title: '诚朴 · 笃学 · 担当 · 创新',
      subtitle: '校训',
      desc: '愿每一位青禾人，都能带着好奇心出发，带着责任感抵达。',
    },
  },

  story: {
    badge: 'Our Story',
    titleHtml: '学校<span class="accent">故事</span>',
    subtitle: '教育，是一场彼此照亮的相遇',
    desc: '记录校园里真实发生的人与事',
    portrait: {
      image: 'assets/img/teacher-2.svg',
      name: '林知远',
      role: '创校教师 · 语文教研组',
      quote: '“学生记住的，往往不是你讲过的某道题，而是你曾经认真看见过他。”',
      paragraphs: [
        '2015 年，林知远老师来到刚刚创办的青禾中学。那时的校园只有一栋教学楼，操场还是泥地。第一批学生只有 180 人，很多孩子来自周边乡镇，第一次离开家开始寄宿生活。',
        '十年间，他坚持每周和至少五名学生单独聊一次天，记录他们的情绪、困惑和小小的进步。他发起的“青禾读书会”从一间教室扩展到全校，成为许多学生高中时代最温暖的记忆。',
        '如今，青禾的校园变大了，但林老师仍然保持着当年的习惯：提前十分钟到教室，站在门口，和每一个进来的学生打招呼。',
      ],
    },
    spirit: {
      tag: 'Our Spirit',
      titleHtml: '青禾<span class="accent">精神</span>',
      subtitle: '我们珍视的三件事',
      cards: [
        { icon: '🌾', title: '扎根', desc: '脚踏实地，把每一件小事做好。' },
        { icon: '☀️', title: '向光', desc: '保持好奇，永远向着更好的自己。' },
        { icon: '🌊', title: '奔流', desc: '拥抱变化，在不确定中保持行动。' },
      ],
    },
    cta: {
      title: '每一段故事，都从一次相遇开始',
      desc: '欢迎来青禾走一走，看看这里的课堂、操场和那些正在生长的年轻人。',
      action: { label: '预约校园开放日', href: 'mailbox.html' },
    },
  },

  sections: {
    news: {
      tag: 'Latest News',
      titleHtml: '最新<span class="accent">资讯</span>',
      subtitle: '校园动态 · 师生风采 · 教育观察',
    },
    gallery: {
      tag: 'Campus Gallery',
      titleHtml: '校园<span class="accent">风光</span>',
      subtitle: '记录校园里每一帧日常',
    },
    countdown: {
      tag: 'Important Dates',
      titleHtml: '重要日程<span style="color: var(--accent-light);">倒计时</span>',
      subtitle: '把握每一刻 · 奋斗正当时',
      items: [
        { icon: '📚', label: '距离期末考试', date: '2027-01-15' },
        { icon: '🎓', label: '距离毕业典礼', date: '2027-06-20' },
      ],
    },
    announcements: {
      tag: 'Announcements',
      titleHtml: '公告<span class="accent">通知</span>',
      subtitle: '学校最新通知与重要安排',
    },
    mailbox: {
      tag: 'Principal Mailbox',
      titleHtml: '校长信箱<span class="accent">查询</span>',
      subtitle: '您的每一条建议，我们都会认真倾听',
    },
    faq: {
      tag: 'School FAQ',
      titleHtml: '校务<span class="accent">问答</span>',
      subtitle: '覆盖作息、招生、生活等常见问题 · 输入问题或浏览全部',
    },
    replies: {
      tag: 'Featured Replies',
      titleHtml: '校长信箱<span class="accent">精选回复</span>',
      subtitle: '学校对师生和家长关切的公开回应',
    },
    links: {
      tag: 'Partner Links',
      titleHtml: '友情<span class="accent">链接</span>',
      subtitle: '常用教育服务平台',
    },
  },

  pages: {
    home: {
      title: '青禾中学 · 向光生长，逐梦而行',
      description:
        '青禾中学官方网站：了解学校简介、新闻动态、公告通知、师资力量、校园风光、学子风采与招生信息。',
    },
    about: {
      title: '学校简介 - 青禾中学',
      description: '了解青禾中学的办学历史、办学理念、校园环境与育人特色。',
      badge: 'About Our School',
      titleHtml: '学校<span class="accent">简介</span>',
      subtitle: '向光生长 · 逐梦而行',
      desc: '一所以学生成长为中心的现代学校',
      heroShort: false,
    },
    story: {
      title: '学校故事 - 青禾中学',
      description: '记录青禾中学师生真实发生的故事。',
      badge: 'Our Story',
      titleHtml: '学校<span class="accent">故事</span>',
      subtitle: '教育，是一场彼此照亮的相遇',
      desc: '记录校园里真实发生的人与事',
      heroShort: false,
    },
    announcements: {
      title: '公告通知 - 青禾中学',
      description: '查看青禾中学最新公告、教务通知、校务通知与活动安排。',
      badge: 'Announcements',
      titleHtml: '公告<span class="accent">通知</span>',
      subtitle: '重要安排 · 及时送达',
      desc: '教务 / 校务 / 活动 / 紧急通知',
      heroShort: true,
    },
    news: {
      title: '新闻动态 - 青禾中学',
      description: '浏览青禾中学最新校园新闻与教育动态。',
      badge: 'News & Stories',
      titleHtml: '新闻<span class="accent">动态</span>',
      subtitle: '看见校园里正在发生的事',
      desc: '校园动态 · 教学教研 · 学生成长',
      heroShort: true,
    },
    teachers: {
      title: '师资力量 - 青禾中学',
      description: '认识青禾中学的教师团队与名师工作室。',
      badge: 'Our Faculty',
      titleHtml: '师资<span class="accent">力量</span>',
      subtitle: '名师领航 · 匠心筑梦',
      desc: '一支师德高尚、业务精湛、结构合理的教师队伍',
      heroShort: true,
    },
    gallery: {
      title: '校园风光 - 青禾中学',
      description: '通过图片了解青禾中学的校园建筑、自然环境与学习空间。',
      badge: 'Campus Gallery',
      titleHtml: '校园<span class="accent">风光</span>',
      subtitle: '120 余亩 · 现代化山水校园',
      desc: '优美的校园环境与现代化教学设施',
      heroShort: true,
    },
    students: {
      title: '学子风采 - 青禾中学',
      description: '青禾中学学生在竞赛、社团与志愿服务中的成长故事。',
      badge: 'Student Spotlight',
      titleHtml: '学子<span class="accent">风采</span>',
      subtitle: '青春正好 · 奋斗当时',
      desc: '竞赛获奖 · 社团活动 · 志愿公益',
      heroShort: true,
    },
    admission: {
      title: '招生简章 - 青禾中学',
      description: '查看青禾中学最新招生简章、招生计划与报名流程。',
      badge: 'Admissions',
      titleHtml: '招生<span class="accent">简章</span>',
      subtitle: '欢迎报考 · 共创未来',
      desc: '招生计划 · 报名流程 · 奖助政策',
      heroShort: true,
    },
    mailbox: {
      title: '校长信箱 - 青禾中学',
      description: '向青禾中学提交咨询、建议、投诉或举报，并查询回复。',
      badge: 'Principal Mailbox',
      titleHtml: '校长<span class="accent">信箱</span>',
      subtitle: '您的每一条建议 · 我们都会认真倾听',
      desc: '支持匿名留言 · 查询码查询回复',
      heroShort: true,
    },
    changelog: {
      title: '更新日志 - 青禾中学',
      description: '查看本站的版本更新记录。',
      badge: 'Changelog',
      titleHtml: '更新<span class="accent">日志</span>',
      subtitle: '每一次改进，都值得被记录',
      desc: '新功能 · 优化 · 修复 · 安全',
      heroShort: true,
    },
  },

  modules: {
    ai: true,
    faq: true,
    mailbox: true,
    announcements: true,
    gallery: true,
    students: true,
    clubs: true,
    changelog: true,
    analytics: false,
  },

  /**
   * 后端地址。留空 = 纯静态模式：
   *   - 新闻 / 公告 / 招生等直接读 data/*.json
   *   - 校长信箱保存在浏览器 localStorage（仅演示）
   *   - 问答按钮使用本地 FAQ 检索
   * 部署 Flask 后端后填 "http://localhost:5000" 或同域网关地址。
   */
  api: {
    base: '',
  },

  ai: {
    name: '青禾小助手',
    statusText: '本地知识库 · 可接入任意 OpenAI 兼容模型',
    endpoint: '', // 例如：'/api/chat'
    welcome:
      '你好，我是青禾小助手。你可以问我学校作息、招生、课程、社团等常见问题。',
    suggestions: [
      { label: '学校简介', question: '介绍一下青禾中学' },
      { label: '作息时间', question: '学校几点上课？' },
      { label: '招生政策', question: '招生有什么要求？' },
      { label: '特色社团', question: '学校有哪些学生社团？' },
    ],
    disclaimer: '回答由 AI 生成 · 仅基于本校知识库 · 仅供参考',
  },

  faq: {
    title: '校务问答 · 校内知识库',
    placeholder: '问点啥？例如：几点上课？几点放学？',
    disclaimer: '基于校内 FAQ 知识库 · 不调用大模型 · 仅供参考',
  },

  mailbox: {
    // auto：优先调用后端，失败时自动降级为浏览器本地演示
    mode: 'auto',
    introTitle: '致师生家长的一封信',
    intro: [
      '尊敬的老师、同学和家长，欢迎您通过校长信箱向学校提出宝贵的意见和建议。我们将认真对待每一条留言，努力改进学校工作。',
      '每一份声音都会被倾听，每一个建议都值得被尊重。提交后系统会生成查询码，您可以随时查询回复状态。',
    ],
    types: [
      { value: 'consultation', icon: '💬', label: '咨询', hint: '作息 / 课程 / 请假等' },
      { value: 'complaint', icon: '⚠️', label: '投诉', hint: '对学校工作的意见' },
      { value: 'suggestion', icon: '💡', label: '建议', hint: '对学校发展的想法' },
      { value: 'report', icon: '🚨', label: '举报', hint: '违规违纪等' },
    ],
  },

  analytics: {
    enabled: false,
    apiBase: '',
  },
};
