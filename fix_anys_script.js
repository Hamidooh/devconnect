const fs = require('fs');

function fixFile(path, regexes) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of regexes) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(path, content, 'utf8');
  console.log(`Fixed ${path}`);
}

fixFile('src/components/CreatePostModal.tsx', [
  [/\(data as any\)\?/g, 'data?'],
  [/\(session\?\.user as any\)\?/g, 'session?.user?'],
  [/cache\.readQuery\(\{ query: GET_FEED \}\) as any/g, 'cache.readQuery<{ feed: any[] }>({ query: GET_FEED })'],
  [/useMutation\(CREATE_POST/g, 'useMutation<{ createPost: any }>(CREATE_POST']
]);

fixFile('src/components/EditProfileModal.tsx', [
  [/user: any/g, 'user: { name?: string | null, username?: string | null, bio?: string | null, image?: string | null, coverImage?: string | null }'],
  [/\} catch \(err: any\) \{/g, '} catch (err: unknown) {']
]);

fixFile('src/app/notifications/page.tsx', [
  [/\(data as any\)\?/g, 'data?'],
  [/notification: any/g, 'notification: { type: string, sender: { name: string } }'],
  [/notif: any/g, 'notif: { id: string, type: string, sender: { name: string, image: string | null }, post: { id: string, content: string } | null, createdAt: Date, read: boolean }'],
  [/useQuery\(GET_NOTIFICATIONS/g, 'useQuery<{ getNotifications: any[] }>(GET_NOTIFICATIONS']
]);

fixFile('src/app/messages/[id]/page.tsx', [
  [/\(session\?\.user as any\)\?/g, 'session?.user?'],
  [/\(session as any\)\?\.user/g, 'session?.user'],
  [/\(userData as any\)\?/g, 'userData?'],
  [/\(messagesData as any\)\?/g, 'messagesData?'],
  [/\(data as any\)\?/g, 'data?'],
  [/\}\) as any/g, '})'],
  [/useQuery\(GET_USER/g, 'useQuery<{ user: { id: string, name: string | null, image: string | null } }>(GET_USER'],
  [/useQuery\(GET_MESSAGES/g, 'useQuery<{ getMessages: any[] }>(GET_MESSAGES'],
  [/useMutation\(SEND_MESSAGE/g, 'useMutation<{ sendMessage: any }>(SEND_MESSAGE'],
  [/msg: any/g, 'msg: { id: string, content: string, sender: { id: string } }']
]);

fixFile('src/app/post/[id]/page.tsx', [
  [/\(session\?\.user as any\)\?/g, 'session?.user?'],
  [/\(data as any\)\?/g, 'data?'],
  [/\}\) as any/g, '})'],
  [/useQuery\(GET_POST/g, 'useQuery<{ post: any }>(GET_POST'],
  [/useMutation\(CREATE_COMMENT/g, 'useMutation<{ createComment: any }>(CREATE_COMMENT'],
  [/comment: any/g, 'comment: { id: string, content: string, createdAt: Date, author: { id: string, name: string | null, username: string | null, image: string | null } }']
]);

['src/app/profile/page.tsx', 'src/app/profile/[id]/page.tsx'].forEach(path => {
  fixFile(path, [
    [/\(session\?\.user as any\)\?/g, 'session?.user?'],
    [/f: any/g, 'f: { id: string }'],
    [/post: any/g, 'post: { id: string, content: string, createdAt: Date, mediaUrl: string | null, likes: any[], comments: any[] }'],
    [/comment: any/g, 'comment: { id: string, content: string, createdAt: Date, post: { id: string } }'],
    [/like: any/g, 'like: { id: string, createdAt: Date, post: { id: string, content: string, mediaUrl: string | null } }'],
    [/u: any/g, 'u: { id: string, name: string | null, username: string | null, image: string | null }'],
    [/useQuery\(GET_USER_PROFILE/g, 'useQuery<{ user: any }>(GET_USER_PROFILE']
  ]);
});
