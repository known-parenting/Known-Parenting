/* known: parenting — Library content: Learn page, books, recommended resources, games list. */

window.KP_LEARN = [
  {t:"A tool for connection, not a replacement for it",p:"known: parenting is built to be opened for a minute and then put down. The goal is never more time in the app. It's more time looking at your kids instead of a screen. If the app ever starts competing with them for your attention, close it."},
  {t:"How to use it well",list:[
    "Open it once a day. Read the challenge, then put the phone away and go do it.",
    "Use the draw cards when you're stuck, not as a script. Your own questions are better.",
    "Missed a day? You get one grace day each week, so your streak survives a busy day.",
    "Save their answers after the moment, not during it. Be there first."]},
  {t:"Our story",p:"We're parents too, trying to love our kids well in the middle of full, busy days. We built Known because we kept realizing the days are long but the years are short. We wanted one small, intentional step each day, with Christ at the center of our home."},
  {t:"Why it's built this way",p:"Every challenge, question and moment is matched to your child's stage, and each one tells you why it matters, drawing from Scripture and from what research shows about how kids grow and connect."},
  {t:"Your data stays yours",p:"Your kids' names, birthdays and memories are saved privately on your phone. Nothing is sold or shared. Use Back up my data in Settings now and then."}
];

/* Read-together books. Each page: text + crayon pictures [x,y = 0–1 across the page, s = size]. q = talk-about-it questions. */
window.KP_BOOKS = [
  {"t":"Who Made the Stars?","a":"0–3","fa":1,
   "q":["What do you think is the best thing God made?", "Can you find something God made right now?"],
   "pages":[
    {"text": "Who made the sun that wakes us up?", "items": [{"a": "sun", "x": 0.5, "y": 0.45, "s": 1.9, "r": 0}]},
    {"text": "God made the sun, warm and bright.", "items": [{"a": "sun", "x": 0.3, "y": 0.35, "s": 1.2, "r": 0}, {"a": "flower", "x": 0.7, "y": 0.62, "s": 1.2, "r": 0}]},
    {"text": "Who made the moon and the twinkly stars?", "items": [{"a": "moon", "x": 0.4, "y": 0.45, "s": 1.6, "r": 0}, {"a": "star", "x": 0.78, "y": 0.3, "s": 0.8, "r": 0}, {"a": "star", "x": 0.2, "y": 0.75, "s": 0.6, "r": 0}]},
    {"text": "God made the night, and He made the stars, every single one.", "items": [{"a": "moon", "x": 0.25, "y": 0.35, "s": 1, "r": 0}, {"a": "star", "x": 0.55, "y": 0.3, "s": 0.7, "r": 0}, {"a": "star", "x": 0.8, "y": 0.55, "s": 0.9, "r": 0}, {"a": "star", "x": 0.45, "y": 0.72, "s": 0.6, "r": 0}]},
    {"text": "Who made the trees and the birds and the fish?", "items": [{"a": "tree", "x": 0.25, "y": 0.5, "s": 1.4, "r": 0}, {"a": "bird", "x": 0.68, "y": 0.3, "s": 0.9, "r": 0}, {"a": "fish", "x": 0.7, "y": 0.75, "s": 0.9, "r": 0}]},
    {"text": "God made them all.", "items": [{"a": "redwood", "x": 0.2, "y": 0.5, "s": 1.1, "r": 0}, {"a": "bird", "x": 0.5, "y": 0.3, "s": 0.8, "r": 0}, {"a": "fish", "x": 0.8, "y": 0.72, "s": 0.8, "r": 0}, {"a": "flower", "x": 0.5, "y": 0.72, "s": 0.8, "r": 0}]},
    {"text": "And who made you?", "items": [{"a": "little", "x": 0.5, "y": 0.55, "s": 1.8, "r": 0}]},
    {"text": "God made you, and He loves you very much.", "items": [{"a": "little", "x": 0.4, "y": 0.6, "s": 1.4, "r": 0}, {"a": "heart", "x": 0.72, "y": 0.35, "s": 1.1, "r": 0}]}]},
  {"t":"Noah and the Very Big Boat","a":"2–5","fa":1,
   "q":["How do you think Noah felt waiting in the boat?", "What does the rainbow remind us about God?"],
   "pages":[
    {"text": "Noah loved God, even when the people around him did not.", "items": [{"a": "person", "x": 0.4, "y": 0.55, "s": 1.5, "r": 0}, {"a": "heart", "x": 0.72, "y": 0.35, "s": 0.9, "r": 0}]},
    {"text": "God told Noah, “Build a very big boat.” So Noah built and built and built.", "items": [{"a": "boat", "x": 0.55, "y": 0.55, "s": 1.9, "r": 0}, {"a": "person", "x": 0.18, "y": 0.62, "s": 0.9, "r": 0}]},
    {"text": "Two by two the animals came. Birds and sheep, and many, many more.", "items": [{"a": "boat", "x": 0.5, "y": 0.45, "s": 1.4, "r": 0}, {"a": "sheep", "x": 0.25, "y": 0.8, "s": 0.8, "r": 0}, {"a": "bird", "x": 0.75, "y": 0.22, "s": 0.7, "r": 0}, {"a": "sheep", "x": 0.75, "y": 0.8, "s": 0.7, "r": 0}]},
    {"text": "Then the rain came down, and down, and down, for forty days and forty nights.", "items": [{"a": "cloud", "x": 0.3, "y": 0.25, "s": 1.1, "r": 0}, {"a": "cloud", "x": 0.72, "y": 0.3, "s": 1, "r": 0}, {"a": "boat", "x": 0.5, "y": 0.72, "s": 1.1, "r": 0}]},
    {"text": "The water was high, but the boat floated safely. God kept Noah and the animals safe.", "items": [{"a": "boat", "x": 0.5, "y": 0.55, "s": 1.5, "r": 0}, {"a": "heart", "x": 0.82, "y": 0.25, "s": 0.7, "r": 0}]},
    {"text": "At last the rain stopped. A little bird found dry land.", "items": [{"a": "sun", "x": 0.75, "y": 0.25, "s": 1, "r": 0}, {"a": "bird", "x": 0.35, "y": 0.4, "s": 0.9, "r": 0}, {"a": "mountain", "x": 0.5, "y": 0.75, "s": 1.3, "r": 0}]},
    {"text": "God put a rainbow in the sky. It was His promise, and God always keeps His promises.", "items": [{"a": "rainbow", "x": 0.5, "y": 0.5, "s": 2.1, "r": 0}]}]},
  {"t":"The Little Lost Sheep","a":"3–6","fa":1,
   "q":["Have you ever been lost? How did it feel to be found?", "Who are the people who would always come looking for you?"],
   "pages":[
    {"text": "A good shepherd had one hundred sheep. He knew every one of them by name.", "items": [{"a": "person", "x": 0.22, "y": 0.55, "s": 1.3, "r": 0}, {"a": "sheep", "x": 0.55, "y": 0.45, "s": 0.8, "r": 0}, {"a": "sheep", "x": 0.78, "y": 0.62, "s": 0.8, "r": 0}, {"a": "sheep", "x": 0.5, "y": 0.78, "s": 0.7, "r": 0}]},
    {"text": "One evening he counted: ninety-seven, ninety-eight, ninety-nine…", "items": [{"a": "sheep", "x": 0.3, "y": 0.5, "s": 0.8, "r": 0}, {"a": "sheep", "x": 0.55, "y": 0.6, "s": 0.8, "r": 0}, {"a": "sheep", "x": 0.8, "y": 0.48, "s": 0.8, "r": 0}, {"a": "moon", "x": 0.82, "y": 0.18, "s": 0.7, "r": 0}]},
    {"text": "One little sheep was missing!", "items": [{"a": "sheep", "x": 0.5, "y": 0.55, "s": 1.3, "r": 0}, {"a": "cloud", "x": 0.75, "y": 0.2, "s": 0.7, "r": 0}]},
    {"text": "The shepherd did not say, “Oh well.” He went out into the dark to look.", "items": [{"a": "person", "x": 0.35, "y": 0.55, "s": 1.3, "r": 0}, {"a": "moon", "x": 0.75, "y": 0.25, "s": 0.9, "r": 0}, {"a": "mountain", "x": 0.72, "y": 0.75, "s": 1, "r": 0}]},
    {"text": "He searched over hills and through the trees.", "items": [{"a": "mountain", "x": 0.3, "y": 0.6, "s": 1.2, "r": 0}, {"a": "tree", "x": 0.72, "y": 0.55, "s": 1.1, "r": 0}, {"a": "star", "x": 0.5, "y": 0.18, "s": 0.6, "r": 0}]},
    {"text": "There it was! The shepherd lifted the little sheep onto his shoulders and carried it home.", "items": [{"a": "person", "x": 0.42, "y": 0.55, "s": 1.4, "r": 0}, {"a": "sheep", "x": 0.62, "y": 0.32, "s": 0.8, "r": 0}, {"a": "heart", "x": 0.8, "y": 0.7, "s": 0.7, "r": 0}]},
    {"text": "Jesus said God loves us just like that. He comes looking for us, every single time.", "items": [{"a": "sheep", "x": 0.35, "y": 0.6, "s": 1.1, "r": 0}, {"a": "heart", "x": 0.68, "y": 0.4, "s": 1.2, "r": 0}]}]},
  {"t":"David and the Giant","a":"5–10","fa":1,
   "q":["What is something big that feels scary to you right now?", "Where did David's courage come from?"],
   "pages":[
    {"text": "David was a shepherd boy. He watched his family's sheep and sang songs to God.", "items": [{"a": "person", "x": 0.3, "y": 0.55, "s": 1.2, "r": 0}, {"a": "sheep", "x": 0.68, "y": 0.62, "s": 0.9, "r": 0}, {"a": "sun", "x": 0.78, "y": 0.2, "s": 0.7, "r": 0}]},
    {"text": "A giant named Goliath came out every day and shouted at God's people. Everyone was afraid.", "items": [{"a": "person", "x": 0.5, "y": 0.5, "s": 2.4, "r": 0}, {"a": "little", "x": 0.15, "y": 0.8, "s": 0.6, "r": 0}]},
    {"text": "But David was not afraid. He said, “The God who kept me safe from the lion and the bear will help me now.”", "items": [{"a": "little", "x": 0.35, "y": 0.6, "s": 1.4, "r": 0}, {"a": "heart", "x": 0.7, "y": 0.35, "s": 1, "r": 0}]},
    {"text": "David did not wear the king's heavy armor. He went to the stream and chose five smooth stones.", "items": [{"a": "stone", "x": 0.3, "y": 0.65, "s": 0.7, "r": 0}, {"a": "stone", "x": 0.5, "y": 0.7, "s": 0.6, "r": 0}, {"a": "stone", "x": 0.7, "y": 0.62, "s": 0.7, "r": 0}, {"a": "little", "x": 0.5, "y": 0.3, "s": 0.9, "r": 0}]},
    {"text": "Goliath laughed at the boy. David answered, “You come with a sword, but I come in the name of the Lord.”", "items": [{"a": "person", "x": 0.7, "y": 0.5, "s": 2, "r": 0}, {"a": "little", "x": 0.22, "y": 0.65, "s": 1, "r": 0}]},
    {"text": "David swung his sling. One stone flew… and the giant fell down!", "items": [{"a": "stone", "x": 0.55, "y": 0.35, "s": 0.6, "r": 0}, {"a": "person", "x": 0.68, "y": 0.72, "s": 1.6, "r": 0}, {"a": "little", "x": 0.18, "y": 0.6, "s": 1, "r": 0}]},
    {"text": "God helped David do something brave. God is bigger than the biggest giant.", "items": [{"a": "little", "x": 0.4, "y": 0.6, "s": 1.3, "r": 0}, {"a": "sun", "x": 0.72, "y": 0.3, "s": 1.1, "r": 0}]}]},
  {"t":"Brave Like Esther","a":"8–12","fa":1,
   "q":["When have you had to be brave for someone else?", "Esther prayed before she acted. What could you pray about this week?"],
   "pages":[
    {"text": "Esther was a young woman who became queen of Persia. But the king did not know that she was Jewish.", "items": [{"a": "crown", "x": 0.5, "y": 0.35, "s": 1.3, "r": 0}, {"a": "person", "x": 0.5, "y": 0.72, "s": 1, "r": 0}]},
    {"text": "A proud man named Haman tricked the king into making a law to harm all of Esther's people.", "items": [{"a": "person", "x": 0.35, "y": 0.55, "s": 1.3, "r": 0}, {"a": "cloud", "x": 0.7, "y": 0.3, "s": 1, "r": 0}]},
    {"text": "Esther's cousin Mordecai told her, “Who knows? Maybe you became queen for such a time as this.”", "items": [{"a": "person", "x": 0.3, "y": 0.58, "s": 1.1, "r": 0}, {"a": "person", "x": 0.68, "y": 0.58, "s": 1.1, "r": 0}, {"a": "star", "x": 0.5, "y": 0.2, "s": 0.6, "r": 0}]},
    {"text": "Going to the king without being called could cost Esther her life. So she asked her people to pray and fast with her for three days.", "items": [{"a": "moon", "x": 0.25, "y": 0.3, "s": 0.8, "r": 0}, {"a": "sun", "x": 0.75, "y": 0.3, "s": 0.8, "r": 0}, {"a": "heart", "x": 0.5, "y": 0.68, "s": 1, "r": 0}]},
    {"text": "Then, trusting God, Esther went to the king. “If I perish, I perish,” she said.", "items": [{"a": "crown", "x": 0.65, "y": 0.3, "s": 0.8, "r": 0}, {"a": "person", "x": 0.4, "y": 0.62, "s": 1.3, "r": 0}]},
    {"text": "The king welcomed her. Esther told the truth, and her people were saved.", "items": [{"a": "crown", "x": 0.5, "y": 0.3, "s": 0.9, "r": 0}, {"a": "heart", "x": 0.3, "y": 0.65, "s": 0.8, "r": 0}, {"a": "heart", "x": 0.7, "y": 0.65, "s": 0.8, "r": 0}]},
    {"text": "God put Esther in the right place at the right time. He has a purpose for you, too.", "items": [{"a": "star", "x": 0.5, "y": 0.4, "s": 1.4, "r": 0}, {"a": "little", "x": 0.5, "y": 0.78, "s": 0.8, "r": 0}]}]}
];

/* Shop links. Put your Amazon Associates tag here (like "knownparent-20") and every Shop button uses it.
   A book with its own url uses that instead. With no tag, Shop still works as a plain Amazon search. */
window.KP_AMAZON_TAG = '';

window.KP_RESOURCES = [
  {cat:"For your kids",items:[
    {t:"The Jesus Storybook Bible",by:"Sally Lloyd-Jones",a:"Ages 3–10",why:"Every story points to Jesus. A favorite for bedtime reading.",url:""},
    {t:"The Biggest Story",by:"Kevin DeYoung",a:"Ages 4–10",why:"The whole Bible in ten short, beautifully illustrated chapters.",url:""},
    {t:"Indescribable: 100 Devotions About God & Science",by:"Louie Giglio",a:"Ages 6–10",why:"Short devotions for curious kids who love how the world works.",url:""},
    {t:"Guess How Much I Love You",by:"Sam McBratney",a:"Ages 0–4",why:"A sweet read-aloud about how big a parent's love is.",url:""},
    {t:"The Rabbit Listened",by:"Cori Doerrfeld",a:"Ages 3–6",why:"When something sad happens, the rabbit doesn't fix it. It just listens. A gentle picture of how to sit with someone's big feelings.",url:""},
    {t:"The Color Monster",by:"Anna Llenas",a:"Ages 2–6",why:"A little monster sorts out his mixed-up feelings by color. Gives kids simple words for happy, sad, angry, scared and calm.",url:""}]},
  {cat:"For you",items:[
    {t:"The Whole-Brain Child",by:"Daniel J. Siegel & Tina Payne Bryson",a:"Parenting",why:"Practical ways to help kids handle big feelings, explained simply.",url:""},
    {t:"Shepherding a Child's Heart",by:"Tedd Tripp",a:"Christian parenting",why:"Parenting aimed at the heart, not just behavior.",url:""},
    {t:"Parenting: 14 Gospel Principles",by:"Paul David Tripp",a:"Christian parenting",why:"Grace for the parent as much as the child.",url:""},
    {t:"Hold On to Your Kids",by:"Gordon Neufeld & Gabor Maté",a:"Parenting",why:"Why your relationship with your kids matters more than anything you teach them.",url:""}]}
];

window.KP_GAMES = [
  {t:"Tic-tac-toe",key:"ttt",sub:"Three in a row",play:1},
  {t:"Hangman",key:"hangman",sub:"Guess the word before the petals fall",play:1},
  {t:"Dots and boxes",key:"dots",sub:"Close a box, take another turn",play:1},
  {t:"Connect four",key:"c4",sub:"Four in a row, any direction",play:1},
  {t:"Memory match",key:"memory",sub:"Find the pairs. Take turns or team up",play:1},
  {t:"Bible trivia",key:"trivia",sub:"Ten questions, easy or hard by age",play:1,fa:1},
  {t:"Twenty questions",key:"twenty",sub:"Guess it in 20 yes-or-no questions",play:1},
  {t:"Word chain",key:"chain",sub:"Each word starts with the last letter",play:1}
];
