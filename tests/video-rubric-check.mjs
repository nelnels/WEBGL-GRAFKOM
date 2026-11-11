import assert from 'node:assert/strict';
import {createStory,STORY_DURATION} from '../src/animation/story.js';

// Mengunci gerakan yang diperjelas untuk video; penilaian visual tetap lewat rekaman.
const story=createStory(),tigger=story.characters[2];
assert.equal(STORY_DURATION,68);
const pooh=story.characters[0];
story.update(11.1);const firstWriggle=pooh.root.axisAngle;
assert(Math.abs(firstWriggle)>.08,'Pooh harus terlihat menggeliat saat tersangkut');
assert(pooh.root.axis.toArray().every(v=>Math.abs(v)>.1),'sumbu Pooh harus diagonal');
story.update(12.1);
assert(firstWriggle*pooh.root.axisAngle<0,'Pooh harus menggeliat ke dua arah');
const wriggleWorld=[...pooh.root.world];
for(const t of [10,14,20]){story.update(t);assert.equal(Math.abs(pooh.root.axisAngle),0,'Pooh harus kembali tegak di luar gerakan menggeliat');}
story.update(12.1);assert.deepEqual([...pooh.root.world],wriggleWorld,'gerakan Pooh harus seek-safe');
const poohAxis=pooh.root.axis.toArray(),piglet=story.characters[1];
story.update(22.2);const pigletAxis=piglet.root.axis.toArray(),pigletLean=piglet.root.axisAngle;
assert(pigletLean>.08,'Piglet harus miring saat mencari tumpuan');
assert(pigletAxis.every(v=>Math.abs(v)>.1),'sumbu Piglet harus diagonal');
assert.notDeepEqual(pigletAxis,poohAxis,'arah diagonal Piglet dan Pooh harus berbeda');
const pigletWorld=[...piglet.root.world];
story.update(29);const pigletRest=piglet.root.scale.clone();
story.update(34);assert(piglet.root.scale.y/pigletRest.y<.9,'Piglet squash terbaca pada tarikan pertama');
story.update(47);
assert(piglet.root.scale.y/pigletRest.y<.85,'tarikan kedua memberi squash lebih kuat');
assert(piglet.root.scale.x>pigletRest.x&&piglet.root.scale.z>pigletRest.z,'squash sedikit melebarkan X/Z');
story.update(49);assert.deepEqual(piglet.root.scale.toArray(),pigletRest.toArray(),'skala Piglet kembali setelah tarikan');
for(const t of [20,24,29]){story.update(t);assert.equal(Math.abs(piglet.root.axisAngle),0,'Piglet harus kembali tegak sebelum tarikan bersama');}
story.update(22.2);assert.deepEqual([...piglet.root.world],pigletWorld,'kemiringan Piglet harus seek-safe');
story.update(25.5);
assert.notDeepEqual(tigger.root.axis.toArray(),poohAxis);
assert.notDeepEqual(tigger.root.axis.toArray(),pigletAxis);
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
