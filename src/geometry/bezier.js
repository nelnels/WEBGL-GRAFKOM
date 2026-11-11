export class BezierCurve {
  constructor(points){this.points=points.map(p=>p.clone());}
  getPoint(t){
    const u=Math.max(0,Math.min(1,t)),work=this.points.map(p=>p.clone());
    // De Casteljau: interpolasi berulang antar-titik kontrol menghasilkan kurva Bezier.
    for(let level=work.length-1;level>0;level--){
      for(let i=0;i<level;i++)work[i].multiplyScalar(1-u).add(work[i+1].clone().multiplyScalar(u));
    }
    return work[0];
  }
}
