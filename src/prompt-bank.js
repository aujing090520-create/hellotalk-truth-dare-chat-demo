/**
 * 单聊题库采用两套独立语义：
 * - 真心话：只问具体问题，玩家用文字如实回答。
 * - 大冒险：只给可在当前聊天里完成的动作，组件由题目指定。
 *
 * 所有题目都围绕当前单聊双方：用留白、语气和场景增加关系升温的引导，
 * 但不含性、身体、隐私追问或线下见面要求。
 */
const text = (id, text) => ({ id, text, responseType: 'text' });
const voice = (id, text) => ({ id, text, responseType: 'voice', maxSeconds: 60 });
const emoji3 = (id, text) => ({ id, text, responseType: 'emoji_3', selectionCount: 3 });
const photo = (id, text) => ({ id, text, responseType: 'photo', mediaType: 'photo' });

export const promptBank = {
  truth: [
    text('truth_01', '第一次聊天时，你最希望对方先问你什么？'),
    text('truth_02', '在和对方的聊天里，你通常更像哪种角色？'),
    text('truth_03', '你觉得对方身上什么特点会让你想继续聊下去？'),
    text('truth_04', '你觉得对方最容易误会你的哪一面？'),
    text('truth_05', '哪句话明明很普通，但从特定的人嘴里说出来就会让你多看一眼？'),
    text('truth_06', '聊天时，对方做什么小动作会让你默默记住？'),
    text('truth_07', '如果对方突然说“想听你讲点什么”，你最想分享哪件事？'),
    text('truth_08', '你最喜欢对方怎么称呼你？'),
    text('truth_09', '什么样的开场白会让你愿意马上回复？'),
    text('truth_10', '如果让对方给你贴三个标签，你希望是哪三个？'),
    text('truth_11', '如果要给对方推荐一首歌，你会选什么氛围？为什么？'),
    text('truth_12', '最近最想和对方一起做的一件事是什么？'),
    text('truth_13', '你最想用哪个表情回应对方？它通常代表什么？'),
    text('truth_14', '如果用一首歌表达你现在对这段聊天的感觉，你会选什么类型？'),
    text('truth_15', '你最喜欢和对方分享什么类型的内容？'),
    text('truth_16', '对方做什么小事会让你觉得很会聊天？'),
    text('truth_17', '如果给对方一个本局限定昵称，你会取什么？'),
    text('truth_18', '有没有一次聊天结束后，你还在回想对方说的哪句话？'),
    text('truth_19', '什么样的聊天瞬间，会让你舍不得说晚安？'),
    text('truth_20', '什么时候你会主动给对方发消息？'),
    text('truth_21', '你更喜欢和对方慢慢聊，还是想到什么就分享？为什么？'),
    text('truth_22', '哪种夸奖听起来像随口一说，但你会偷偷记很久？'),
    text('truth_23', '如果今晚还要继续聊，你最想和对方玩什么小游戏？'),
    text('truth_24', '什么话题能让你和对方很快聊开？'),
  ],
  dare: [
    text('dare_text_01', '你给对方取一个本局限定的友好昵称，并发给对方。'),
    text('dare_text_02', '你发一句让对方觉得你有点可爱的自我介绍。'),
    text('dare_text_03', '你用正在学习的语言写一句“你好，很高兴认识你”。'),
    text('dare_text_04', '从对方刚才说过的话里挑一个细节，认真夸一句。'),
    text('dare_text_05', '发一句像是不经意、其实认真想过的夸奖，别直接说“你很好”。'),
    text('dare_text_06', '发一句让对方看完会想接着问你的话，不许只说“你好”。'),
    text('dare_text_07', '发一个你想和对方一起完成的轻松小挑战。'),
    text('dare_text_08', '给对方发一句只有今天有效的称赞。'),
    voice('dare_voice_01', '你发一条语音，用电台主持人的口吻打个招呼。'),
    voice('dare_voice_02', '你发一条语音说出对方给你的第一印象，把最先想到的那个词放在最后。'),
    voice('dare_voice_03', '你发一条语音，说一句对方会喜欢听、但平时不一定有人说的话。'),
    voice('dare_voice_04', '你发一条语音，说一句如果现在结束聊天，你会有点可惜的话。'),
    voice('dare_voice_05', '你发一条语音，夸对方刚刚聊天里出现的一个小细节。'),
    voice('dare_voice_06', '你发一条语音说三句话：一句像初见，一句像熟悉，一句留给对方猜。'),
    voice('dare_voice_07', '你发一条语音，说说下次聊天可以从哪里接着开始。'),
    voice('dare_voice_08', '你用一句话安利一首适合在聊天里悄悄分享的歌。'),
    emoji3('dare_emoji_01', '你用三个表情表达今天和对方聊天的状态。'),
    emoji3('dare_emoji_02', '你用三个表情排一条你们的周末预告。'),
    emoji3('dare_emoji_03', '你用三个表情发一个希望对方接住的话题线索。'),
    emoji3('dare_emoji_04', '你用三个表情重现你看到对方第一句话时的心情。'),
    emoji3('dare_emoji_05', '你用三个表情给对方贴一个只有你能解释的标签。'),
    emoji3('dare_emoji_06', '你用三个表情发一条不解释的消息，让对方来猜。'),
    emoji3('dare_emoji_07', '你用三个表情表示：这段聊天可以再多十分钟。'),
    emoji3('dare_emoji_08', '你用三个表情预告你希望对方下一句怎么接。'),
    photo('dare_photo_01', '从相册发一张你平时不太会主动发、但愿意让对方看到的照片。'),
    photo('dare_photo_02', '从相册选一张能代表你今天心情的照片，只给对方一个提示。'),
    photo('dare_photo_03', '发一张生活里刚好被你拍下来的小片段，让对方猜故事。'),
    photo('dare_photo_04', '发一张你看到会想和人分享的照片，再问对方第一眼看到了什么。'),
  ],
};

export const responseComponentSpec = {
  text: { component: '文字输入框', submit: '完成并继续', rules: '真心话与文字大冒险均必填；仅文字作答' },
  voice: { component: '原地短语音录制条', submit: '发送', rules: '最长 60 秒；不提供文字替代' },
  emoji_3: { component: '直接展示全部表情的 8 列网格', submit: '完成并继续', rules: '必须选满 3 个' },
  photo: { component: '系统相册/文件选择器 + 单张图片预览', submit: '完成并继续', rules: '选择 1 张照片；支持更换或删除后再提交' },
};
