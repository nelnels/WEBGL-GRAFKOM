import assert from 'node:assert/strict';
import {createStory,STORY_DURATION} from '../src/animation/story.js';

// Mengunci gerakan yang diperjelas untuk video; penilaian visual tetap lewat rekaman.
const story=createStory(),tigger=story.characters[2];
assert.equal(STORY_DURATION,68);
story.update(25.5);
assert(tigger.root.axisAngle>.4,'kedatangan harus memperlihatkan kemiringan yang cukup besar');
assert(tigger.root.axis.toArray().every(v=>Math.abs(v)>.1),'sumbu miring harus memiliki tiga komponen');
story.update(61.5);const compressed=tigger.root.scale.y;
story.update(63);assert(compressed/tigger.root.scale.y<.8,'squash persiapan harus terbaca dan kembali normal');
const paw=story.root.getObjectByName('Tigger-front-paw-near');
const elbow=story.root.getObjectByName('Tigger-elbow-near');
assert.equal(paw.parent,elbow);assert.equal(elbow.parent,tigger.parts.arms[0]);
const sample=t=>{story.update(t);return [tigger.parts.arms[0].rotation.z,elbow.rotation.z,paw.rotation.z,[...paw.world]];};
const a=sample(61.1),b=sample(64.7);
for(let i=0;i<3;i++)assert(Math.abs(a[i]-b[i])>.1,'bahu, siku dan telapak harus berubah');
assert.notDeepEqual(a[3],b[3]);
sample(3);assert.deepEqual(sample(64.7),b,'gerakan baru harus seek-safe');
console.log('Bukti video: sumbu diagonal, squash, hierarki bahu-siku-telapak dan replay lulus.');
