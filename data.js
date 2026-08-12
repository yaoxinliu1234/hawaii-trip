window.HAWAII_DATA = {
  tripDates: {
    start: "2026-10-13",
    end: "2026-10-19",
    label: "2026.10.13 – 10.19",
    nights: 6,
    days: 7
  },
  tripFlights: {
    legs: []
  },
  islands: {
    oahu: {
      id: "oahu",
      name: "欧胡岛",
      englishName: "Oahu",
      emoji: "🏄",
      color: "#0B6E8A",
      description: "夏威夷人口最多的岛屿，首府檀香山所在地。融合都市活力、历史底蕴和世界顶级冲浪海滩。",
      attractions: [
        { id: "waikiki", name: "威基基海滩", englishName: "Waikiki Beach", emoji: "🏖️", category: "海滩", rating: 5, duration: "1-2天", location: "Honolulu 南岸", ticket: "免费", description: "世界最著名的海滩之一，3.2公里长的月牙形沙滩。适合初学者冲浪、游泳和欣赏钻石头火山全景。", tips: ["日落时分最美", "冲浪课约$80/2小时", "周末较拥挤"] },
        { id: "pearlharbor", name: "珍珠港", englishName: "Pearl Harbor", emoji: "⚓", category: "文化", rating: 5, duration: "半天", location: "Honolulu 西侧", ticket: "免费-$35/人", description: "1941年12月7日日本偷袭珍珠港的历史遗址。亚利桑那号纪念馆、密苏里号战舰和太平洋航空博物馆值得一访。", tips: ["亚利桑那号需提前预约", "不可带包，有寄存", "建议早到"] },
        { id: "northshore", name: "North Shore 北岸", englishName: "North Shore", emoji: "🏄", category: "冒险", rating: 5, duration: "1天", location: "Oahu 北岸", ticket: "免费", description: "世界冲浪圣地，冬季浪高达6-12米。Banzai Pipeline和Sunset Beach是顶级赛事场地。", tips: ["冬季看冲浪比赛", "夏季适合游泳浮潜", "品尝Shrimp Truck"] },
        { id: "hanauma", name: "Hanauma Bay 恐龙湾", englishName: "Hanauma Bay", emoji: "🐢", category: "海滩", rating: 5, duration: "半天", location: "Oahu 东南", ticket: "$25/人（非居民）", description: "死火山口形成的天然海湾，欧胡岛最佳浮潜地。水质清澈，可看到数百种热带鱼和绿海龟。", tips: ["需在线预约", "先看环保教育视频", "不可涂普通防晒霜"] },
        { id: "diamondhead", name: "钻石头山", englishName: "Diamond Head Crater", emoji: "💎", category: "冒险", rating: 4, duration: "2-3小时", location: "Honolulu 东南", ticket: "$5/人 + $10/停车", description: "檀香山标志性火山锥，徒步至山顶可360度俯瞰威基基、太平洋和檀香山全景。", tips: ["需提前预约门票", "早上7点前人少", "带水和防晒"] },
        { id: "polynesian", name: "波利尼西亚文化中心", englishName: "Polynesian Cultural Center", emoji: "🌺", category: "文化", rating: 4, duration: "1天", location: "Oahu 北岸 Laie", ticket: "$90-240/人", description: "展示波利尼西亚六国文化的主题公园，含精彩晚宴秀 Ha: Breath of Life。", tips: ["买含晚餐秀的套票", "下午1点开门", "BYU学生运营"] },
        { id: "kualoa", name: "古兰尼牧场", englishName: "Kualoa Ranch", emoji: "🎬", category: "冒险", rating: 5, duration: "半天-1天", location: "Oahu 东岸 Kaneohe", ticket: "$50-180/Tour", description: "3000英亩私人牧场，侏罗纪公园等多部好莱坞大片的拍摄地。", tips: ["提前预订Tour", "Movie Sites Tour最受欢迎", "Ko'olau山脉背景绝美"] },
        { id: "lanikai", name: "Lanikai 海滩", englishName: "Lanikai Beach", emoji: "🌅", category: "海滩", rating: 5, duration: "2-3小时", location: "Oahu 东岸 Kailua", ticket: "免费", description: "多次被评为美国最美海滩，粉白细沙和蒂芙尼蓝海水。可远眺双子岛，日出绝佳。", tips: ["停车位紧张", "可徒步Lanikai Pillbox Trail", "清晨最佳"] }
      ]
    },
    bigIsland: {
      id: "bigIsland",
      name: "夏威夷大岛",
      englishName: "Big Island",
      emoji: "🌋",
      color: "#C1440E",
      description: "夏威夷群岛中面积最大的岛屿，拥有活火山、黑沙滩、雪山和热带雨林，是自然爱好者的天堂。",
      attractions: [
        { id: "hvnp", name: "夏威夷火山国家公园", englishName: "Hawaii Volcanoes National Park", emoji: "🌋", category: "自然", rating: 5, duration: "1-2天", location: "Big Island 东南部", ticket: "$30/车（7天有效）", description: "联合国教科文组织世界遗产，可近距离观赏基拉韦厄和冒纳罗亚两座活火山。", tips: ["穿防滑鞋，带手电筒", "关注官网火山活动预警", "夜间可见熔岩 glow"] },
        { id: "maunakea", name: "Mauna Kea 观星", englishName: "Mauna Kea Stargazing", emoji: "⭐", category: "冒险", rating: 5, duration: "半天-1天", location: "Big Island 中部", ticket: "免费（Tour $200+）", description: "海拔4207米的休眠火山，世界最佳观星地之一。山顶有13座天文台。", tips: ["需4WD车辆或参加Tour", "在Visitor Center适应海拔", "带厚外套，山顶极冷"] },
        { id: "punaluu", name: "Punalu'u 黑沙滩", englishName: "Punalu'u Black Sand Beach", emoji: "🏖️", category: "海滩", rating: 4, duration: "2-3小时", location: "Big Island 南岸", ticket: "免费", description: "由火山熔岩碎屑形成的独特黑沙滩，常可见绿海龟在岸边休息。", tips: ["不要触摸海龟", "不建议游泳，浪大", "带防晒和饮用水"] },
        { id: "papakolea", name: "Papakōlea 绿沙滩", englishName: "Papakōlea Green Sand Beach", emoji: "💚", category: "海滩", rating: 4, duration: "半天", location: "Big Island 最南端", ticket: "免费", description: "全球仅4处绿沙滩之一，橄榄石晶体赋予沙滩独特的绿色。", tips: ["徒步约5km往返", "不建议自行开普通车", "风大，注意防晒"] },
        { id: "akaka", name: "Akaka Falls 瀑布", englishName: "Akaka Falls State Park", emoji: "💦", category: "自然", rating: 4, duration: "1-2小时", location: "Big Island 东岸 Hilo附近", ticket: "$5/人，$10/车", description: "135米高的壮观瀑布，穿过热带雨林环线即可到达。", tips: ["环线约0.6km，轻松", "雨后瀑布更壮观", "穿防滑鞋"] },
        { id: "manta", name: "魔鬼鱼夜潜", englishName: "Manta Ray Night Snorkel", emoji: "🐠", category: "冒险", rating: 5, duration: "2-3小时", location: "Kona / Keauhou", ticket: "$100-150/人", description: "Kona海岸独有的夜间浮潜体验，在灯光吸引下与巨大的魔鬼鱼共游。", tips: ["提前预订，非常热门", "不会游泳也可参加", "带防水相机"] },
        { id: "coffee", name: "Kona 咖啡农场", englishName: "Kona Coffee Farm Tour", emoji: "☕", category: "美食", rating: 4, duration: "2-3小时", location: "Big Island 西岸 Kona", ticket: "免费-$25/人", description: "Kona产区是世界顶级咖啡产地，火山土壤孕育出风味独特的Arabica咖啡。", tips: ["Greenwell Farms免费参观", "购买100% Kona Coffee", "上午参观体验最佳"] },
        { id: "hilo", name: "Hilo 彩虹之城", englishName: "Hilo Town", emoji: "🌈", category: "文化", rating: 4, duration: "半天-1天", location: "Big Island 东岸", ticket: "免费", description: "大岛东岸首府，美国最潮湿的城市之一，因此彩虹频现。", tips: ["周三/周六农民市场", "参观Liliuokalani Gardens", "常下雨，带雨具"] }
      ]
    }
  },
  itineraries: {
    trip: {
      name: "Yaoxin 夏威夷 7日 · 10/13–10/19",
      days: [
        { day: 1, date: "10/13", weekday: "周二", title: "", theme: "", island: "bigIsland", stops: [] },
        { day: 2, date: "10/14", weekday: "周三", title: "", theme: "", island: "bigIsland", stops: [] },
        { day: 3, date: "10/15", weekday: "周四", title: "", theme: "", island: "bigIsland", stops: [] },
        { day: 4, date: "10/16", weekday: "周五", title: "", theme: "", island: "oahu", stops: [] },
        { day: 5, date: "10/17", weekday: "周六", title: "", theme: "", island: "oahu", stops: [] },
        { day: 6, date: "10/18", weekday: "周日", title: "", theme: "", island: "oahu", stops: [] },
        { day: 7, date: "10/19", weekday: "周一", title: "", theme: "", island: "oahu", stops: [] }
      ]
    },
    oahu: {
      name: "欧胡岛 · 10/16–10/19",
      days: [
        { day: 1, date: "10/16", weekday: "周五", title: "", theme: "", island: "oahu", stops: [] },
        { day: 2, date: "10/17", weekday: "周六", title: "", theme: "", island: "oahu", stops: [] },
        { day: 3, date: "10/18", weekday: "周日", title: "", theme: "", island: "oahu", stops: [] },
        { day: 4, date: "10/19", weekday: "周一", title: "", theme: "", island: "oahu", stops: [] }
      ]
    },
    bigIsland: {
      name: "大岛 · 10/13–10/15",
      days: [
        { day: 1, date: "10/13", weekday: "周二", title: "", theme: "", island: "bigIsland", stops: [] },
        { day: 2, date: "10/14", weekday: "周三", title: "", theme: "", island: "bigIsland", stops: [] },
        { day: 3, date: "10/15", weekday: "周四", title: "", theme: "", island: "bigIsland", stops: [] }
      ]
    }
  },
  tips: [
    { category: "行程日期", icon: "📅", items: [
      "Yaoxin 行程：2026年10月13日 – 10月19日（共 7 天 / 6 晚）",
      "先大岛 10/13–10/15，再欧胡岛 10/16–10/19（可自行调整）",
      "航班可多段添加，例如：JFK → LAX → KOA，再 KOA → HNL",
      "航班机场填在「手账路线图」顶部，点编辑后 + 加一段航班",
      "行程空白，请自己添加每一站的时间、Notes 和图片"
    ]},
    { category: "从纽约/湾区出发", icon: "✈️", items: [
      "国内航班，持美国驾照或 Real ID 即可登机",
      "纽约（JFK/EWR）→ 檀香山 HNL：约 10-11 小时直飞",
      "湾区（SFO/OAK/SJC）→ 檀香山 HNL：约 5-6 小时直飞",
      "先飞大岛 KOA/ITO，再岛间航班去欧胡岛 HNL",
      "常用航司：Hawaiian、United、Delta、Alaska"
    ]},
    { category: "交通出行", icon: "🚗", items: [
      "岛间航班约 40 分钟（KOA/ITO ↔ HNL）",
      "大岛：强烈建议租车，景点分散",
      "欧胡岛：TheBus 覆盖主要区域，但租车更灵活",
      "左舵右行，注意限速和停车规定"
    ]},
    { category: "防晒与环保", icon: "☀️", items: [
      "强制使用 Reef-Safe 防晒霜",
      "夏威夷阳光强烈，SPF50+、戴帽子和墨镜",
      "不要触摸海龟、珊瑚等海洋生物"
    ]},
    { category: "饮食推荐", icon: "🍽️", items: [
      "必吃：Poke、Loco Moco、Shave Ice",
      "大岛：Kona Coffee、Hilo Farmers Market",
      "欧胡岛：Giovanni's Shrimp Truck、Leonard's Malasada",
      "小费文化：餐厅 15-20%"
    ]},
    { category: "预算参考", icon: "💰", items: [
      "中档约 $250-400/天（酒店 + 餐厅 + 租车）",
      "岛间机票约 $80-150/单程"
    ]}
  ]
};
