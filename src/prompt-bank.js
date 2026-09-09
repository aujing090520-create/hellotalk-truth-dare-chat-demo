/**
 * 单聊题库采用两套独立语义：
 * - 真心话：只问具体问题，玩家用文字如实回答。
 * - 大冒险：只给可在当前聊天里完成的动作，组件由题目指定。
 *
 * 内容面向轻社交与语言交流：增加轻暧昧的好感、夸奖和继续了解引导，
 * 但不含性、身体、隐私追问或线下见面要求。
 */
const text = (id, text) => ({ id, text, responseType: 'text' });
const voice = (id, text) => ({ id, text, responseType: 'voice', maxSeconds: 60 });
const emoji3 = (id, text) => ({ id, text, responseType: 'emoji_3', selectionCount: 3 });
const photo = (id, text) => ({ id, text, responseType: 'photo', mediaType: 'photo' });

export const promptBank = {
  truth: [
    text('truth_01', '第一次聊天时，你最希望对方先问你什么？'),
    text('truth_02', '你通常在朋友群里扮演什么角色？'),
    text('truth_03', '什么样的人最容易让你想继续聊下去？'),
    text('truth_04', '你觉得别人对你的第一印象最常猜错什么？'),
    text('truth_05', '什么样的夸奖会让你忍不住多聊几句？'),
    text('truth_06', '你会因为什么小细节对一个人产生好感？'),
    text('truth_07', '如果对方突然说“想听你讲点什么”，你最想分享哪件事？'),
    text('truth_08', '你最喜欢别人怎么称呼你？'),
    text('truth_09', '什么样的开场白会让你愿意马上回复？'),
    text('truth_10', '如果给自己贴三个社交标签，会是什么？'),
    text('truth_11', '如果要给对方推荐一首歌，你会选什么氛围？为什么？'),
    text('truth_12', '最近最想拉朋友一起做的一件事是什么？'),
    text('truth_13', '你最常用哪个表情？它通常代表什么？'),
    text('truth_14', '如果用一首歌表达你现在对这段聊天的感觉，你会选什么类型？'),
    text('truth_15', '你最喜欢和朋友分享什么类型的内容？'),
    text('truth_16', '别人做什么小事会让你觉得很会聊天？'),
    text('truth_17', '如果给对方一个本局限定昵称，你会取什么？'),
    text('truth_18', '你有没有遇到过聊得很投机的人？当时什么让你想继续？'),
    text('truth_19', '你觉得聊天里哪种瞬间最容易让人心动？'),
    text('truth_20', '什么时候你会主动发消息给朋友？'),
    text('truth_21', '你更喜欢一对一聊天，还是一群人聊天？为什么？'),
    text('truth_22', '你最喜欢收到哪一种夸奖？'),
    text('truth_23', '如果今晚还要继续聊，你最想和对方玩什么小游戏？'),
    text('truth_24', '什么话题能让你和陌生人很快聊开？'),
  ],
  dare: [
    text('dare_text_01', '你给对方取一个本局限定的友好昵称，并发给对方。'),
    text('dare_text_02', '你发一句让对方觉得你有点可爱的自我介绍。'),
    text('dare_text_03', '你用正在学习的语言写一句“你好，很高兴认识你”。'),
    text('dare_text_04', '认真夸对方一个具体的小优点，不许只说“好看”或“可爱”。'),
    text('dare_text_05', '发一句带点暧昧但不尴尬的夸奖，称赞对方的聊天方式。'),
    text('dare_text_06', '发一句让对方想继续回你的话，不许只说“你好”。'),
    text('dare_text_07', '发一个你想和对方一起完成的轻松小挑战。'),
    text('dare_text_08', '用一句专属称赞给对方今天加分。'),
    voice('dare_voice_01', '你发一条语音，用电台主持人的口吻打个招呼。'),
    voice('dare_voice_02', '你发一条语音，说出你对对方的第一印象，语气要真诚。'),
    voice('dare_voice_03', '你发一条语音，夸对方一个具体的聊天优点。'),
    voice('dare_voice_04', '你发一条语音，说一句如果现在收到对方消息，你会开心的话。'),
    voice('dare_voice_05', '你发一条语音，说一句你觉得适合对方的称赞。'),
    voice('dare_voice_06', '你发一条语音，用三句话描述你理想中的聊天对象。'),
    voice('dare_voice_07', '你发一条语音，说一句你愿意和对方继续了解的话。'),
    voice('dare_voice_08', '你用一句话安利一首适合你们一起听的歌。'),
    emoji3('dare_emoji_01', '你用三个表情表达今天的社交状态。'),
    emoji3('dare_emoji_02', '你用三个表情表达你想和对方一起度过的周末。'),
    emoji3('dare_emoji_03', '你用三个表情暗示你最想和对方聊的主题。'),
    emoji3('dare_emoji_04', '你用三个表情表达你第一次看到对方时的感觉。'),
    emoji3('dare_emoji_05', '你用三个表情表达你觉得对方最像哪种类型的人。'),
    emoji3('dare_emoji_06', '你用三个表情给对方发一条只让你们懂的暗号。'),
    emoji3('dare_emoji_07', '你用三个表情表达你想继续聊天的程度。'),
    emoji3('dare_emoji_08', '你用三个表情表达你希望对方下一句说什么。'),
    photo('dare_photo_01', '从相册发一张你觉得最能代表自己魅力的照片，让对方认识真实的你。'),
    photo('dare_photo_02', '从相册选一张能代表你此刻心情的照片发给对方，等对方猜一猜。'),
    photo('dare_photo_03', '发一张你最近拍的生活照，让对方猜猜你当时在做什么。'),
    photo('dare_photo_04', '发一张你觉得适合和对方分享的照片，并说说为什么。'),
  ],
};

export const responseComponentSpec = {
  text: { component: '文字输入框', submit: '完成并继续', rules: '真心话与文字大冒险均必填；仅文字作答' },
  voice: { component: '原地短语音录制条', submit: '发送', rules: '最长 60 秒；不提供文字替代' },
  emoji_3: { component: '直接展示全部表情的 8 列网格', submit: '完成并继续', rules: '必须选满 3 个' },
  photo: { component: '系统相册/文件选择器 + 单张图片预览', submit: '完成并继续', rules: '选择 1 张照片；支持更换或删除后再提交' },
};
