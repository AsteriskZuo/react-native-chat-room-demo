#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs');

const project_root = path.resolve(__dirname, '.');

const file = path.join(project_root, 'src', 'env.ts');
const content = `// This file is automatically generated. The user needs to manually fill in the necessary parameters.\n
export const isDevMode = true;
export const appKey = '';
export const accountType = 'easemob'; // agora or easemob
export const agoraAppId = '';
export const gAvatarUrlBasic = '';
export const gRegisterUserUrl = '';
export const gCreateRoomUrl = '';
export const gGetRoomListUrl = '';
export const account = [{ id: '', token: '' }];
`;
if (fs.existsSync(file) === false) {
  fs.writeFileSync(file, content, 'utf-8');
}
