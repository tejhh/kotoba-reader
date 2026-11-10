import type { JlptLevel } from "@/lib/parser/types";

export interface SampleText {
  id: string;
  title: string;
  level: JlptLevel;
  description: string;
  content: string;
}

/** Original short reading passages written for this app. */
export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: "sample-daily-life",
    title: "私の毎日",
    level: "N5",
    description: "A student describes a typical day.",
    content:
      "私は毎朝六時に起きます。顔を洗って、朝ご飯を食べます。それから、コーヒーを飲みながら新聞を読みます。\n" +
      "八時に家を出て、電車で学校へ行きます。学校で日本語を勉強しています。日本語は少し難しいですが、とても楽しいです。\n" +
      "昼ご飯は友達と一緒に食べます。夜は部屋で本を読んだり、音楽を聞いたりします。十一時に寝ます。",
  },
  {
    id: "sample-kyoto-trip",
    title: "初めての京都旅行",
    level: "N4",
    description: "A first trip to Kyoto in autumn.",
    content:
      "先月、初めて京都へ旅行に行きました。前から行ってみたいと思っていたので、とても嬉しかったです。\n" +
      "京都にはお寺や神社がたくさんあって、どこも景色がきれいでした。秋だったので、山の木が赤や黄色に変わっていました。\n" +
      "天気がよければ、毎日たくさん歩くつもりでしたが、二日目は雨が降ってしまいました。それでも、雨の京都も静かで美しかったです。\n" +
      "友達に「冬に行ったほうがいいよ」と言われたので、今度は冬に行ってみようと思います。",
  },
  {
    id: "sample-environment",
    title: "環境問題について",
    level: "N3",
    description: "A short opinion piece on environmental issues.",
    content:
      "最近、環境問題についてのニュースをよく見るようになった。地球の気温が上がっているのは、人間の生活が大きな影響を与えているからだと言われている。\n" +
      "例えば、車や工場から出るガスによって、空気が汚れてしまう。しかし、技術の発展のおかげで、環境に優しい製品も増えてきた。\n" +
      "一人一人が少しずつ努力すれば、社会全体が変わるはずだ。自分にとって何ができるのか、考えてみる必要があるだろう。",
  },
];
