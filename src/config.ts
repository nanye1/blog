import type {
	AnnouncementConfig,
	CommentConfig,
	ExpressiveCodeConfig,
	FooterConfig,
	FullscreenWallpaperConfig,
	LicenseConfig,
	MusicPlayerConfig,
	NavBarConfig,
	ProfileConfig,
	SakuraConfig,
	SidebarLayoutConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";


// 移除i18n导入以避免循环依赖

// 定义站点语言
const SITE_LANG = "zh_CN"; // 语言代码，例如：'en', 'zh_CN', 'ja' 等。

export const siteConfig: SiteConfig = {
	title: "南叶の小窝",
	subtitle: "欢迎来玩awa",

	lang: SITE_LANG,

	themeColor: {
		hue: 305, // 主题色的默认色相，范围从 0 到 360。例如：红色：0，青色：200，蓝绿色：250，粉色：345
		fixed: false, // 对访问者隐藏主题色选择器
	},

	
	bangumi: {
		userId: "your-bangumi-id", // 在此处设置你的Bangumi用户ID，可以设置为 "sai" 测试
	},

	anime: {
		mode: "local", // 番剧页面模式："bangumi" 使用Bangumi API，"local" 使用本地配置
	},

	banner: {
		enable: true, // 是否启动Banner壁纸模式

		// 支持单张图片或图片数组，当数组长度 > 1 时自动启用轮播
		src: {
			desktop: [
				"/assets/desktop-banner/d1.webp",
				"/assets/desktop-banner/d2.webp",
				"/assets/desktop-banner/d3.webp",
				"/assets/desktop-banner/d4.webp",
				"/assets/desktop-banner/d5.webp",
				"/assets/desktop-banner/d6.webp",
				"/assets/desktop-banner/d7.webp",
				"/assets/desktop-banner/d8.webp",
				"/img/111.png",
				"/img/112.png",
				"/img/113.png",
				"/img/114.png",
				"/img/115.png",
				
			], // 桌面横幅图片
			mobile: [
				"/assets/mobile-banner/m1.webp",
				"/assets/mobile-banner/m2.webp",
				"/assets/mobile-banner/m3.webp",
				"/assets/mobile-banner/m4.webp",
				"/assets/mobile-banner/m5.webp",
				"/assets/mobile-banner/m6.webp",
				"/assets/mobile-banner/m7.webp",
				"/assets/mobile-banner/m8.webp",
				"/img/111.png",
				"/img/112.png",
				"/img/113.png",
				"/img/114.png",
				"/img/115.png",
			], // 移动横幅图片
		}, // 使用本地横幅图片

		position: "center", // 等同于 object-position，仅支持 'top', 'center', 'bottom'。默认为 'center'

		carousel: {
			enable: true, // 为 true 时：为多张图片启用轮播。为 false 时：从数组中随机显示一张图片

			interval: 3 // 轮播间隔时间（秒）
		},

		// PicFlow API支持(智能图片API)
		imageApi: {
			enable: false, // 启用图片API
			url: "http://domain.com/api_v2.php?format=text&count=4", // API地址，返回每行一个图片链接的文本
		},
		// 这里需要使用PicFlow API的Text返回类型,所以我们需要format=text参数
		// 项目地址:https://github.com/matsuzaka-yuki/PicFlow-API
		// 请自行搭建API

		homeText: {
			enable: true, // 在主页显示自定义文本
			title: "欢迎来到南叶の小窝", // 主页横幅主标题

			subtitle: [
				"明明想要杀死某种生物，自己却没有做好被杀死的准备，你不觉得这种想法很奇怪么？——时崎狂三《约会大作战》",
				"我们每天度过的称之为日常的生活，其实是一个个奇迹的连续也说不定。《日常》",
			"与其有闲琢磨如何漂亮死去，还不如漂亮的活到最后一刻。《银魂》",
			"我是要成为海贼王的男人啊ヽ(`Д´)ﾉ~路飞《海贼王》",
			"拥有被杀的觉悟，才有开枪的权利。——鲁鲁修《反叛的鲁鲁修》",
			"朱雀，你要成为英雄，从世界的敌人皇帝鲁路修·V·不列颠尼亚手中拯救世界的救世主，成为 Zero。这也是对你的惩罚，你必须作为正义的使者戴着面具活下去，不用在作为枢木朱雀，也必须为世界牺牲承认该有的幸福，永远-----《叛逆的鲁鲁修》",
			"这是你若不能理解的，人类感情的极致，比希望更热烈，比绝望更深邃的——爱啊！——晓美焰《魔法少女小圆—叛逆的物语》",
			"我们只是活着就已经竭尽全力了。《银魂》",
			"我们终会相知，在那悠远的苍穹。by《缘之空》",
			"零食就是正义！——紫原敦《黑子的篮球》",
			"来吧！颤抖吧！惊叹吧！绝望吧！放声大哭吧！我的艺术就是——————爆炸！———《火影忍者》迪达拉",
			"我觉得你很幸运，因为你可以选择爱我或不爱我，而我只能选择爱你或更爱你。——桂言叶《日在校园》",
			"我终于明白了，你并不是因为命令或者身为 Servant 来保护我，而是出于自身意志，保护了我啊———伊莉亚《Fate stay night》",
			"把已经失去的东西重新变得有意义的职业只有两个，作家和侦探。只有作家才能在梦想中将其复活，只有侦探才能将其从坟墓中挖掘出来还原成信息。---爱丽丝《神的记事本》",
			"不抵抗就不会死，为什么你就是不明白！——卡缪·维丹《机动战士 Z 高达》",
			"没有什么大不了这句话，只有当事者才有资格说——《悠久之翼》",
			"我——撒了一个谎，宫园薰，喜欢渡亮太的，这样的一个谎。这个谎把你——有马公生君，命运般地带到了我的面前。马上，春天就要来了，与你相遇的春天，一个没有你的春天.《四月是你的谎言》",
			"如果这是你的希望的话, 我就随你到天涯海角吧. 即使王座崩坏, 金光闪闪的王冠腐朽, 数之不尽的尸体堆积如山, 我会留在静静横卧的, 小小的王的身边, 直到将军的声音响起, 之时.《黑执事》",
			"谢谢你们! 比谢谢更加的谢谢!--真白《樱花庄的宠物女孩》",
			"悲伤也是会有的, 倒不如说尽是这样的事, 可正是如此我们才更需要前进, 令人唾弃的事由我们来做, 剩下的就去改变世界吧! 塔兹米! 用你炽热的灵魂呐喊吧!--布兰德《斩赤红之瞳》",
			"能哭的地方，只有厕所，和爸爸的怀里。—《clannad》",
			"谁都无法相信未来，谁都无法接受未来。——晓美焰《魔法少女小圆》",
			"隐约雷鸣，阴霾天空，但盼风雨来，能留你在此。《言叶之庭》",
			"要得到幸福的话，就需要与之相应的努力，也就是代价。不是经常说人生是正负和零么！有好事也有痛苦的事，有痛苦的事也有好事。不过这是错的。为了变得幸福，作为代价，必须背负与其同等的不幸。也就是说为了好事情，必须要忍受坏事情。所谓有痛苦的事就有好事什么的，并不是含有乐观意味的话。反过来说，在高的地位上的话，对工作就有相应的高要求对吧。要是不能满足这种高要求就是不诚实的人。再进一步反过来说，要把自己置于不幸中的话，自己就必须放弃一定程度的努力。——壹原侑子《xxxHolic》",
			"这样被诅咒的人生，怎么能接受呢。ー仲村由理《angelbeats》",
			"人类这种生物，有时候是连短短的十分钟也等不起的！———仲村由理《Angel Beats!》",
			"惟愿, 你与你所处的这个世界, 今后也如此幸福。——黑桐干也《空之境界》",
			"你要是没有胜算的话，就由我来创造胜算，尝试一切可能的方法。---Saber《Fate stay night》",
			"面麻最喜欢仁太了…对仁太的喜欢…是想成为仁太新娘的那种喜欢~《未闻花名》",
			"有树叶飞舞的地方，就会有火在燃烧，火的意志照耀着村子，就会有更多的树叶发芽，他们会承载着火的意志，把信念带向远方。——《火影忍者》",
			"雪，只要落下便已是此生的尽头，唯有融化消失，然而，即使飞舞着上升，最后仍不忘落下的那颗种子。虽然有些虚幻，却比什么都坚强。我啊-----虽然绝对算不上什么优秀，但至少，希望能像雪一般，变得坚强起来。----《至少像雪那样》",
			"所谓的觉悟、就是在黑暗的荒野中开辟前行的道路—乔鲁诺乔班纳《JOJO 的奇妙冒险》",
			"即使这份感情是虚假的，这也是我唯一的真实。楪祈《罪恶王冠》",
			"因为我是天才嘛！——樱木花道《灌篮高手》",
			"教练，我想打篮球。三井寿《灌篮高手》",
			"没有痛苦相伴的教训是毫无意义的，因为、人倘若不牺牲些什么，就什么也不可能得到。但是，当直面这些痛苦、克服它们的时候，人将获得不输给任何事物的坚韧的心。没错，钢铁一般的心。——爱德华《钢之炼金术师》",
			"雪为什么是白色的？因为它们忘记了自己本身的颜色……C.C《反叛的鲁路修》",
			"你的所言所行，全都闪烁着光芒，太过刺目，于是我闭上双眼，但内心还是无法停止对你的憧憬。——《四月是你的谎言》",
			"何等失态，罪该万死———提耶利亚《高达 OO》",
			"那个……其实啊，我想说的是，就算我死了，你也要努力活下去。活下去，看着这个世界直到最后，请帮我找出创造这个世界的意义，像我这样的胆小鬼来到这个世界的意义，还有我跟你相遇所代表的意义。——幸《刀剑神域》",
			"一个人才会混乱的吧，即使是在黑暗中，只要有个人和自己一起走的话，就会安心很多，也一定会找到答案的。——《TrueTears》",
			"我错了，善良没有任何意义 渣滓必须受到歧视 我... 要成为王——樱满集《罪恶王冠》",
			"如果每个人都能为自己所爱的事情付诸努力，那崭新的地方定是梦想的终点---《LOVE LIVE》",
			"莫扎特曾经说过大胆地踏上旅途吧，我不知道路途的前方究竟有什么，但是，我们还是迈出了步伐，我们仍在旅途之中。——有马公生《四月是你的谎言》",
			"我可是货真价实的萝莉控，我对女性的好球带是 7 岁到 12 岁 也就是说。。。我只把小学女生当成异性 虽然有时年龄会往下修正，可是绝对不会往上调整 真是的，小学生真是太棒了！---安藤寿来《日常系的异能战斗》",
			"萝莉控不是病，是人生态度啊！安藤寿来《日常系的异能战斗》",
			"我不能喝酒，请给我一杯橙汁。户愚吕弟《幽游白书》",
			"所谓的王者，就是要活的比任何人都要耀眼，成为万民敬仰的存在。伊斯坎达尔《Fate Zero》",
			"如果能在六十亿分之一的概率下次与你相遇，即使你那时候你还是身体无法动弹，我也会和你结婚。」——日向秀树《AngelBeats！》",
			"我想知道，为何世界如此扭曲，这份扭曲又从何产生。为何人类要支配被支配，又是为何人类要如此悲哀的活着.《高达》",
			"瞬间的犹豫可是会丧命的，所以我决不会犹豫。——夏尔《黑执事》",
			"1000 减 7 等于多少？---金木研《东京喰种》",
			"总有一天我会让这里座无虚席!——高坂穗乃果《LoveLive!》",
			"大家的背后，由我来守护！--西谷夕《排球少年》",
			"我讨厌温柔的女孩子。温柔的女孩子其实对所有人都温柔，我却会误以为只对我温柔，然后就沾沾自喜得意忘形，最后闹得不欢而散，双方都受到伤害。——所以我才讨厌温柔的女孩子。《我的青春恋爱物语果然有问题》",
			"我们总是在意错过了多少，却不注意自己拥有多少。——《未闻花名》",
			"没有未来的未来不是我想要的未来！----神原秋人《境界的彼方》",
			"人没有牺牲就没有获得, 如果要获得什么就必须付出同等的代价, 那就是炼金术的等价交换的原则。《钢之炼金术师》",
			"男人变态有什么错！---前原圭一《寒蝉鸣啼之时》",
			"苦难算什么，我本来就喜欢走在修罗之路上--索隆《海贼王》",
			"只要是活着的，就是神也杀给你看––两仪式《空之境界》",
			"你不是一个人，我们是共犯。如果你是魔女的话，我只要成为魔王就可以了吧。《叛逆的鲁鲁修》",
			"大家回答我　为什么要低头，重复一遍　为什么要低头，我们是弱者！现在如此　过去也如此！是的　不是什么都没有改变吗！强者模仿弱者夺来的武器　是无法发挥出其真正的力量的，要说为什么的话　我们的武器本质在于，那弱小到悲屈的软弱啊！我在此强调，我们是弱者！我们宣誓作为弱者活下去，像弱者一样战斗然后已弱者的方式消灭强者！就像过去一样　今后也会贯彻到底！承认吧　我们是最弱的种族！正因为我们天生什么都没有，所以才能驾驭一切的，最弱的种族！----空《no game no life》",
			"是我太愚蠢了，虽然只有一瞬间，我竟然想和你厮守一生。---桔梗《犬夜叉》",
			"不能逃避，不能逃避，不能逃避。—碇真嗣《EVA》",
			"人类最强的武器就是刀和叉-《美食的俘虏》",
			"初见幽灵现真身，始知其为枯芒草。《冰菓》",
			"你不是牺牲了自己的一切，养育我到今天了吗？为了我这样没出息的儿子，耗费了自己的一生。已经足够了！---冈崎朋也《CLANNAD》",
			"关于自己的生活，我和你都不是读者，而是作者。至少结局，还是能自己说了算的。――银桑《银魂》",
			"即使交不到 100 个朋友也没有关系，只要交到一个比 100 个朋友更重要的朋友。——《我的朋友很少》",
			"无论发生了什么，也不要后悔与我相遇。《CLANNAD AFTER STORY》",
			"或许前路永夜，即便如此我也要前进，因为星光即使微弱也会为我照亮前途。《四月是你的谎言》",
			"能原谅女人谎话的————才是男人！香吉士《海贼王》",
			"有个器官比我的心脏还重要，虽然我看不见它，但是它确实在我的体内，因为有它我才能站的直，就算步履蹒跚也能笔直往前走。如果我不去的话，它可是会拦腰折断的，我的灵魂它会拦腰折断的。比起心脏停止跳动，我更重视它。坂田银时《银魂》",
			"群聚的都是弱者。弱小的草食动物才喜欢群聚。《家庭教师》",
			"遥远的不是距离，而是次元啊！---安艺伦也《路人女主的养成方法》",
			"亚丝娜，我的命是你的——桐谷和人《刀剑神域》",
			"即使是走过无数次的路，也能走到从未踏足过的地方，正因为是走过无数次的路，景色才会变幻万千，光是这样还不足够吗？因为只是这样，所以才不足够吗？——函南优一《空中杀手》",
			"错的不是我，而是这个世界。《東京喰种》",
			"时间可以冲淡一切，但，我並不想用时间来磨平伤口。《黑执事》",
			"爱德：「等价交换，我的人生给你一半，所以你的人生也给我一半。」温迪：「哈.. 你是笨蛋啊？」爱德：「你说什么？」温迪：「别说一半，全部都给你呀！」——《钢之炼金术师 FA》",
			"不要哀求，学会争取若是如此，终有所获。——阿德洛克•萨斯顿《交响诗篇》",
			"秒速 5 厘米，那是樱花飘落的速度，那么怎样的速度，才能走完我与你之间的距离？——《秒速五厘米》",
			"一切都是 Steins Gate 的选择！《命运石之门》",
			"可能会有迷茫的時候，也可能会有因为不如意而觉得烦躁的时候。无论是谁都会遇到低谷，但只有跨越低谷的人才能得到大家的认可。《花开物语》",
			"剑本凶器，剑术是杀人术，这是无法用语言掩饰的。为了断这之间的宿命，正是这把逆刃剑的使命——不杀之誓《浪客剑心》",
			"明明感觉距离很近 但伸手却又抓不到 即使这样 即使望尘莫及 亦有留在心中的东西 曾身处同一时间层 曾仰望过同一样东西 只要记着这些 就算相互远离 也依然可以相信我们还是同在 现在要不停蹦跑 只要目标远大 总有一天 会赶上那目标《fate/stay night》",
			"把绫波，还给我! 我变成怎么样无所谓，世界变成怎样也无所谓，但是绫波，至少她一个人，我一定要救出来！——碇真嗣《eva:破》",


			],
			typewriter: {
				enable: true, // 启用副标题打字机效果

				speed: 100, // 打字速度（毫秒）
				deleteSpeed: 50, // 删除速度（毫秒）
				pauseTime: 2000, // 完全显示后的暂停时间（毫秒）
			},
		},

		credit: {
			enable: false, // 显示横幅图片来源文本

			text: "Describe", // 要显示的来源文本
			url: "", // （可选）原始艺术品或艺术家页面的 URL 链接
		},

		navbar: {
			transparentMode: "semifull", // 导航栏透明模式："semi" 半透明加圆角，"full" 完全透明，"semifull" 动态透明
		},
	},
	toc: {
		enable: true, // 启用目录功能
		depth: 3, // 目录深度，1-6，1 表示只显示 h1 标题，2 表示显示 h1 和 h2 标题，依此类推
	},
	generateOgImages: false, // 启用生成OpenGraph图片功能,注意开启后要渲染很长时间，不建议本地调试的时候开启
	favicon: [
		// 留空以使用默认 favicon
		// {
		//   src: '/favicon/icon.png',    // 图标文件路径
		//   theme: 'light',              // 可选，指定主题 'light' | 'dark'
		//   sizes: '32x32',              // 可选，图标大小
		// }
	],

	// 字体配置
	font: {
		zenMaruGothic: {
			enable: true, // 启用全局圆体适合日语和英语，对中文适配一般
		},
		hanalei: {
			enable: false, // 启用 Hanalei 字体作为全局字体，适合中文去使用
		},
	},
	showLastModified: true, // 控制“上次编辑”卡片显示的开关
};
export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = {
	enable: true, // 启用全屏壁纸功能,非Banner模式下生效
	src: {
		desktop: [
			"/assets/desktop-banner/d1.webp",
			"/assets/desktop-banner/d2.webp",
			"/assets/desktop-banner/d3.webp",
			"/assets/desktop-banner/d4.webp",
			"/assets/desktop-banner/d5.webp",
			"/assets/desktop-banner/d6.webp",
			"/assets/desktop-banner/d7.webp",
			"/assets/desktop-banner/d8.webp",
				"/img/111.png",
				"/img/112.png",
				"/img/113.png",
				"/img/114.png",
				"/img/115.png",
		], // 桌面横幅图片
		mobile: [
			"/assets/mobile-banner/m1.webp",
			"/assets/mobile-banner/m2.webp",
			"/assets/mobile-banner/m3.webp",
			"/assets/mobile-banner/m4.webp",
			"/assets/mobile-banner/m5.webp",
			"/assets/mobile-banner/m6.webp",
			"/assets/mobile-banner/m7.webp",
			"/assets/mobile-banner/m8.webp",
				"/img/111.png",
				"/img/112.png",
				"/img/113.png",
				"/img/114.png",
				"/img/115.png",
		], // 移动横幅图片
	}, // 使用本地横幅图片
	position: "center", // 壁纸位置，等同于 object-position
	carousel: {
		enable: true, // 启用轮播
		interval: 1, // 轮播间隔时间（秒）
	},
	zIndex: -1, // 层级，确保壁纸在背景层
	opacity: 0.8, // 壁纸透明度
	blur: 1, // 背景模糊程度
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		// 支持自定义导航栏链接,并且支持多级菜单,3.1版本新加
		{
			name: "链接",
			url: "/links/",
			icon: "material-symbols:link",
			children: [
				{
					name: "GitHub",
					url: "https://github.com/",
					external: false,
					icon: "fa6-brands:github",
				},
				{
					name: "Bilibili",
					url: "hhttps://www.bilibili.com/",
					external: true,
					icon: "fa6-brands:bilibili",
				},
				{
					name: "Gitee",
					url: "https://gitee.com/matsuzakayuki/Mizuki",
					external: false,
					icon: "mdi:git",
				},
			],
		},
		
		{
			name: "我的",
			url: "/content/",
			icon: "material-symbols:person",
			children: [
				LinkPreset.Anime,
				LinkPreset.Diary,
				{
					name: "相册",
					url: "/albums/",
					icon: "material-symbols:photo-library",
				},
			],
		},
		{
			name: "关于",
			url: "/content/",
			icon: "material-symbols:info",
			children: [LinkPreset.About, LinkPreset.Friends],
		},
		{
			name: "其他",
			url: "#",
			icon: "material-symbols:more-horiz",
			children: [
				{
					name: "工程",
					url: "/projects/",
					icon: "material-symbols:work",
				},
				{
					name: "技能",
					url: "/skills/",
					icon: "material-symbols:psychology",
				},
				{
					name: "时间线",
					url: "/timeline/",
					icon: "material-symbols:timeline",
				},
			],
		},
		
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/img/2.png", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
	name: "南叶酱",
	bio: "摸鱼ing...",
	links: [
		{
			name: "Bilibli",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/1874516838?spm_id_from=333.1007.0.0",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/nanye1/nanye1.github.io",
		},
	
	
		
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意：某些样式（如背景颜色）已被覆盖，请参阅 astro.config.mjs 文件。
	// 请选择深色主题，因为此博客主题目前仅支持深色背景
	theme: "github-dark",
};

export const commentConfig: CommentConfig = {
	enable: true, // 启用评论功能。当设置为 false 时，评论组件将不会显示在文章区域。
	twikoo: {
		envId: "https://twikoo.vercel.app",
		lang: "zh-CN", // 设置 Twikoo 评论系统语言为英文
	},
};

export const announcementConfig: AnnouncementConfig = {
	title: "公告", // 公告标题
	content: "评论不能用！！！\n其他里的东西暂时还没改，不是我的！！\n问题反馈和建议请加qq420883290", 
	// 公告内容
	closable: true, // 允许用户关闭公告
	link: {
		enable: true, // 启用链接
		text: "Learn More", // 链接文本
		url: "/about/", // 链接 URL
		external: false, // 内部链接
	},
};

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: true, // 启用音乐播放器功能
};

export const footerConfig: FooterConfig = {
	enable: true, // 是否启用Footer HTML注入功能
};

// 直接编辑 FooterConfig.html 文件来添加备案号等自定义内容

/**
 * 侧边栏布局配置
 * 用于控制侧边栏组件的显示、排序、动画和响应式行为
 */
export const sidebarLayoutConfig: SidebarLayoutConfig = {
	// 是否启用侧边栏功能
	enable: true,

	// 侧边栏位置：左侧或右侧
	position: "left",

	// 侧边栏组件配置列表
	components: [
		{
			// 组件类型：用户资料组件
			type: "profile",
			// 是否启用该组件
			enable: true,
			// 组件显示顺序（数字越小越靠前）
			order: 1,
			// 组件位置："top" 表示固定在顶部
			position: "top",
			// CSS 类名，用于应用样式和动画
			class: "onload-animation",
			// 动画延迟时间（毫秒），用于错开动画效果
			animationDelay: 0,
		},
		{
			// 组件类型：公告组件
			type: "announcement",
			// 是否启用该组件（现在通过统一配置控制）
			enable: true,
			// 组件显示顺序
			order: 2,
			// 组件位置："top" 表示固定在顶部
			position: "top",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间
			animationDelay: 50,
		},
		{
			// 组件类型：分类组件
			type: "categories",
			// 是否启用该组件
			enable: true,
			// 组件显示顺序
			order: 3,
			// 组件位置："sticky" 表示粘性定位，可滚动
			position: "sticky",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间
			animationDelay: 150,
			// 响应式配置
			responsive: {
				// 折叠阈值：当分类数量超过5个时自动折叠
				collapseThreshold: 5,
			},
		},
		{
			// 组件类型：标签组件
			type: "tags",
			// 是否启用该组件
			enable: true,
			// 组件显示顺序
			order: 5,
			// 组件位置："sticky" 表示粘性定位
			position: "sticky",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间
			animationDelay: 250,
			// 响应式配置
			responsive: {
				// 折叠阈值：当标签数量超过20个时自动折叠
				collapseThreshold: 20,
			},
		},
	],

	// 默认动画配置
	defaultAnimation: {
		// 是否启用默认动画
		enable: true,
		// 基础延迟时间（毫秒）
		baseDelay: 0,
		// 递增延迟时间（毫秒），每个组件依次增加的延迟
		increment: 50,
	},

	// 响应式布局配置
	responsive: {
		// 断点配置（像素值）
		breakpoints: {
			// 移动端断点：屏幕宽度小于768px
			mobile: 768,
			// 平板端断点：屏幕宽度小于1024px
			tablet: 1024,
			// 桌面端断点：屏幕宽度小于1280px
			desktop: 1280,
		},
		// 不同设备的布局模式
		//hidden:不显示侧边栏(桌面端)   drawer:抽屉模式(移动端不显示)   sidebar:显示侧边栏
		layout: {
			// 移动端：抽屉模式
			mobile: "sidebar",
			// 平板端：显示侧边栏
			tablet: "sidebar",
			// 桌面端：显示侧边栏
			desktop: "sidebar",
		},
	},
};

export const sakuraConfig: SakuraConfig = {
	enable: true, // 默认关闭樱花特效
	sakuraNum: 21, // 樱花数量
	limitTimes: -1, // 樱花越界限制次数，-1为无限循环
	size: {
		min: 0.5, // 樱花最小尺寸倍数
		max: 1.1, // 樱花最大尺寸倍数
	},
	opacity: {
		min: 0.3, // 樱花最小不透明度
		max: 0.9, // 樱花最大不透明度
	},
	speed: {
		horizontal: {
			min: -1.7, // 水平移动速度最小值
			max: -1.2, // 水平移动速度最大值
		},
		vertical: {
			min: 1.5, // 垂直移动速度最小值
			max: 2.2, // 垂直移动速度最大值
		},
		rotation: 0.03, // 旋转速度
		fadeSpeed: 0.03, // 消失速度，不应大于最小不透明度
	},
	zIndex: 100, // 层级，确保樱花在合适的层级显示
};

// Pio 看板娘配置
export const pioConfig: import("./types/config").PioConfig = {
	enable: true, // 启用看板娘
	models: ["/pio/models/pio/model.json"], // 默认模型路径
	position: "left", // 默认位置在右侧
	width: 280, // 默认宽度
	height: 250, // 默认高度
	mode: "draggable", // 默认为可拖拽模式
	hiddenOnMobile: true, // 默认在移动设备上隐藏
	dialog: {
		welcome: "欢迎来到南叶の小窝", // 欢迎词
		touch: [
			"你在干什么?",
			"再摸我就报警了！",
			"HENTAI!",
			"不可以这样欺负我啦!",
		], // 触摸提示
		home: "点这里回到首页!", // 首页提示
		skin: ["想看看我的新衣服吗?", "新衣服真漂亮~"], // 换装提示
		close: "QWQ 下次再见啦~", // 关闭提示
		link: "https://github.com/nanye1/blog", // 关于链接
	},
};

// 导出所有配置的统一接口
export const widgetConfigs = {
	profile: profileConfig,
	announcement: announcementConfig,
	music: musicPlayerConfig,
	layout: sidebarLayoutConfig,
	sakura: sakuraConfig,
	fullscreenWallpaper: fullscreenWallpaperConfig,
	pio: pioConfig, // 添加 pio 配置
} as const;

export const umamiConfig = {
	enabled: true, // 是否显示Umami统计
	apiKey: import.meta.env.UMAMI_API_KEY || "api_5tGoMJfVbjCJwDtnEL0ubinLDEsWK9rO", // API密钥优先从环境变量读取，否则使用配置文件中的值
	baseUrl: "https://api.umami.is", // Umami Cloud API地址
	scripts: `
<script defer src="https://cloud.umami.is/script.js" data-website-id="7fabb2a3-5947-4797-9910-f2e19907b97b"></script>
  `.trim(), // 上面填你要插入的Script,不用再去Layout中插入
} as const;
