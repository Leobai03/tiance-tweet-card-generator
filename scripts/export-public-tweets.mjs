import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archiveRoot = path.resolve(projectRoot, "../..");
const dataRoot = path.join(archiveRoot, "data");

function loadArchive(filename, target) {
  const source = fs.readFileSync(path.join(dataRoot, filename), "utf8");
  const context = { window: { YTD: { tweets: {}, note_tweet: {} } } };
  vm.createContext(context);
  vm.runInContext(source, context);
  return target(context.window.YTD);
}

const tweets = loadArchive("tweets.js", (ytd) => ytd.tweets.part0.map((row) => row.tweet));
const notes = loadArchive("note-tweet.js", (ytd) => ytd.note_tweet.part0.map((row) => row.noteTweet));
const notesByTimestamp = new Map(notes.map((note) => [note.createdAt, note]));

function toIsoTimestamp(createdAt) {
  return new Date(createdAt).toISOString().replace(/\.\d{3}Z$/, ".000Z");
}

function normalize(text = "") {
  return text
    .replace(/https:\/\/t\.co\/\S+/g, "")
    .replace(/…/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFullText(tweet) {
  const exact = notesByTimestamp.get(toIsoTimestamp(tweet.created_at));
  if (exact) return exact.core?.text ?? tweet.full_text ?? "";

  const preview = normalize(tweet.full_text);
  if (preview.length >= 30) {
    const matches = notes.filter((note) => normalize(note.core?.text).startsWith(preview));
    if (matches.length === 1) return matches[0].core?.text ?? tweet.full_text ?? "";
  }
  return tweet.full_text ?? "";
}

const records = tweets
  .filter((tweet) => !tweet.in_reply_to_status_id_str)
  .filter((tweet) => !(tweet.full_text ?? "").startsWith("RT @"))
  .map((tweet) => {
    const date = new Date(tweet.created_at).toISOString().slice(0, 10);
    const likes = Number(tweet.favorite_count || 0);
    const reposts = Number(tweet.retweet_count || 0);
    return {
      id: tweet.id_str,
      date,
      text: getFullText(tweet),
      likes,
      reposts,
      engagement: likes + reposts,
      url: `https://x.com/Leobai825/status/${tweet.id_str}`,
    };
  })
  .sort((a, b) => b.engagement - a.engagement || b.date.localeCompare(a.date));

const outputPath = path.join(projectRoot, "src", "tweets.json");
fs.writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
console.log(`Exported ${records.length} public original posts to ${outputPath}`);
