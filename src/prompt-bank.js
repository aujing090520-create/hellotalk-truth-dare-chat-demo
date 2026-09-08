/**
 * 单聊题库采用两套独立语义：
 * - 真心话：只问具体问题，玩家用文字如实回答。
 * - 大冒险：只给可在当前聊天里完成的动作，组件由题目指定。
 *
 * 内容面向轻社交与语言交流：促进接话、共同偏好和第一印象，不含性、
 * 身体、隐私追问或线下见面要求。
 */
const text = (id, text) => ({ id, text, responseType: 'text' });
const voice = (id, text) => ({ id, text, responseType: 'voice', maxSeconds: 60 });
const emoji3 = (id, text) => ({ id, text, responseType: 'emoji_3', selectionCount: 3 });

export const promptBank = {
  truth: [
    text('truth_01', '第一次聊天时，你最希望对方先问你什么？'),
    text('truth_02', '你通常在朋友群里扮演什么角色？'),
    text('truth_03', '什么样的人最容易让你想继续聊下去？'),
    text('truth_04', '你觉得别人对你的第一印象最常猜错什么？'),
    text('truth_05', '你最擅长把什么话题聊得有意思？'),
    text('truth_06', '朋友最常来找你帮什么忙？'),
    text('truth_07', '和新朋友一起玩时，你最喜欢什么活动？'),
    text('truth_08', '你最喜欢别人怎么称呼你？'),
    text('truth_09', '什么样的开场白会让你愿意马上回复？'),
    text('truth_10', '如果给自己贴三个社交标签，会是什么？'),
    text('truth_11', '你会把哪一种本地食物先推荐给新朋友？'),
    text('truth_12', '最近最想拉朋友一起做的一件事是什么？'),
    text('truth_13', '你最常用哪个表情？它通常代表什么？'),
    text('truth_14', '你会用哪一首歌介绍自己？'),
    text('truth_15', '你最喜欢和朋友分享什么类型的内容？'),
    text('truth_16', '别人做什么小事会让你觉得很会聊天？'),
    text('truth_17', '如果只能教对方一句家乡话，你会教哪一句？'),
    text('truth_18', '你最愿意带新朋友去了解家乡的哪里？'),
    text('truth_19', '你觉得最有趣的一句外语表达是什么？'),
    text('truth_20', '什么时候你会主动发消息给朋友？'),
    text('truth_21', '你更喜欢一对一聊天，还是一群人聊天？为什么？'),
    text('truth_22', '你最喜欢收到哪一种夸奖？'),
    text('truth_23', '如果和朋友计划一天出游，你最看重什么？'),
    text('truth_24', '什么话题能让你和陌生人很快聊开？'),
  ],
  dare: [
    text('dare_text_01', '你给对方取一个本局限定的友好昵称，并发给对方。'),
    text('dare_text_02', '你写一句有记忆点的自我介绍，不超过 15 个字。'),
    text('dare_text_03', '你用正在学习的语言写一句“你好，很高兴认识你”。'),
    text('dare_text_04', '你用一句话夸夸自己，再发给对方。'),
    text('dare_text_05', '你写下一个喜欢的外语词，并标注意思。'),
    text('dare_text_06', '你写一句适合发给新朋友的开场白。'),
    text('dare_text_07', '你写一个想和对方继续聊的话题。'),
    text('dare_text_08', '你用一句友好的话，为对方的今天加油。'),
    voice('dare_voice_01', '你发一条语音，用电台主持人的口吻打个招呼。'),
    voice('dare_voice_02', '你发一条语音，介绍你的城市。'),
    voice('dare_voice_03', '你发一条语音，推荐一种你喜欢的食物。'),
    voice('dare_voice_04', '你发一条语音，说一个你常用的打招呼方式。'),
    voice('dare_voice_05', '你发一条语音，说一句你正在学习的语言。'),
    voice('dare_voice_06', '你发一条语音，读出一个你喜欢的外语单词。'),
    voice('dare_voice_07', '你发一条语音，说一件今天值得开心的小事。'),
    voice('dare_voice_08', '你发一条语音，用一句话安利一首歌。'),
    emoji3('dare_emoji_01', '你用三个表情表达今天的社交状态。'),
    emoji3('dare_emoji_02', '你用三个表情表达理想的周末。'),
    emoji3('dare_emoji_03', '你用三个表情表达最想去的地方。'),
    emoji3('dare_emoji_04', '你用三个表情介绍和朋友出游时的样子。'),
    emoji3('dare_emoji_05', '你用三个表情表达最常做的休闲活动。'),
    emoji3('dare_emoji_06', '你用三个表情表达会推荐的食物。'),
    emoji3('dare_emoji_07', '你用三个表情给自己发送一份好心情。'),
    emoji3('dare_emoji_08', '你用三个表情表达想和朋友一起做的事。'),
  ],
};

export const responseComponentSpec = {
  text: { component: '文字输入框', submit: '完成并继续', rules: '真心话与文字大冒险均必填；仅文字作答' },
  voice: { component: '原地短语音录制条', submit: '发送', rules: '最长 60 秒；不提供文字替代' },
  emoji_3: { component: '直接展示全部表情的 8 列网格', submit: '完成并继续', rules: '必须选满 3 个' },
};
