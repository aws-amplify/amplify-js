Object.defineProperty(exports,"__esModule",{value:true});exports.default=
















BigInteger;

































function BigInteger(a,b){
if(a!=null)this.fromString(a,b);
}


function nbi(){
return new BigInteger(null);
}


var dbits;


var canary=0xdeadbeefcafe;
var j_lm=(canary&0xffffff)==0xefcafe;









function am1(i,x,w,j,c,n){
while(--n>=0){
var v=x*this[i++]+w[j]+c;
c=Math.floor(v/0x4000000);
w[j++]=v&0x3ffffff;
}
return c;
}



function am2(i,x,w,j,c,n){
var xl=x&0x7fff,xh=x>>15;
while(--n>=0){
var l=this[i]&0x7fff;
var h=this[i++]>>15;
var m=xh*l+h*xl;
l=xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
c=(l>>>30)+(m>>>15)+xh*h+(c>>>30);
w[j++]=l&0x3fffffff;
}
return c;
}


function am3(i,x,w,j,c,n){
var xl=x&0x3fff,xh=x>>14;
while(--n>=0){
var l=this[i]&0x3fff;
var h=this[i++]>>14;
var m=xh*l+h*xl;
l=xl*l+((m&0x3fff)<<14)+w[j]+c;
c=(l>>28)+(m>>14)+xh*h;
w[j++]=l&0xfffffff;
}
return c;
}
var inBrowser=typeof navigator!=="undefined";
if(inBrowser&&j_lm&&navigator.appName=="Microsoft Internet Explorer"){
BigInteger.prototype.am=am2;
dbits=30;
}else
if(inBrowser&&j_lm&&navigator.appName!="Netscape"){
BigInteger.prototype.am=am1;
dbits=26;
}else
{
BigInteger.prototype.am=am3;
dbits=28;
}

BigInteger.prototype.DB=dbits;
BigInteger.prototype.DM=(1<<dbits)-1;
BigInteger.prototype.DV=1<<dbits;

var BI_FP=52;
BigInteger.prototype.FV=Math.pow(2,BI_FP);
BigInteger.prototype.F1=BI_FP-dbits;
BigInteger.prototype.F2=2*dbits-BI_FP;


var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC=new Array();
var rr,vv;
rr="0".charCodeAt(0);
for(vv=0;vv<=9;++vv){
BI_RC[rr++]=vv;}
rr="a".charCodeAt(0);
for(vv=10;vv<36;++vv){
BI_RC[rr++]=vv;}
rr="A".charCodeAt(0);
for(vv=10;vv<36;++vv){
BI_RC[rr++]=vv;}

function int2char(n){
return BI_RM.charAt(n);
}
function intAt(s,i){
var c=BI_RC[s.charCodeAt(i)];
return c==null?-1:c;
}


function bnpCopyTo(r){
for(var i=this.t-1;i>=0;--i){
r[i]=this[i];}
r.t=this.t;
r.s=this.s;
}


function bnpFromInt(x){
this.t=1;
this.s=x<0?-1:0;
if(x>0)this[0]=x;else
if(x<-1)this[0]=x+this.DV;else
this.t=0;
}


function nbv(i){
var r=nbi();

r.fromInt(i);

return r;
}


function bnpFromString(s,b){
var k;
if(b==16)k=4;else
if(b==8)k=3;else
if(b==2)k=1;else
if(b==32)k=5;else
if(b==4)k=2;else
throw new Error("Only radix 2, 4, 8, 16, 32 are supported");
this.t=0;
this.s=0;
var i=s.length,mi=false,sh=0;
while(--i>=0){
var x=intAt(s,i);
if(x<0){
if(s.charAt(i)=="-")mi=true;
continue;
}
mi=false;
if(sh==0)this[this.t++]=x;else
if(sh+k>this.DB){
this[this.t-1]|=(x&(1<<this.DB-sh)-1)<<sh;
this[this.t++]=x>>this.DB-sh;
}else this[this.t-1]|=x<<sh;
sh+=k;
if(sh>=this.DB)sh-=this.DB;
}
this.clamp();
if(mi)BigInteger.ZERO.subTo(this,this);
}


function bnpClamp(){
var c=this.s&this.DM;
while(this.t>0&&this[this.t-1]==c){
--this.t;}
}


function bnToString(b){
if(this.s<0)return"-"+this.negate().toString();
var k;
if(b==16)k=4;else
if(b==8)k=3;else
if(b==2)k=1;else
if(b==32)k=5;else
if(b==4)k=2;else
throw new Error("Only radix 2, 4, 8, 16, 32 are supported");
var km=(1<<k)-1,d,m=false,r="",i=this.t;
var p=this.DB-i*this.DB%k;
if(i-->0){
if(p<this.DB&&(d=this[i]>>p)>0){
m=true;
r=int2char(d);
}
while(i>=0){
if(p<k){
d=(this[i]&(1<<p)-1)<<k-p;
d|=this[--i]>>(p+=this.DB-k);
}else{
d=this[i]>>(p-=k)&km;
if(p<=0){
p+=this.DB;
--i;
}
}
if(d>0)m=true;
if(m)r+=int2char(d);
}
}
return m?r:"0";
}


function bnNegate(){
var r=nbi();

BigInteger.ZERO.subTo(this,r);

return r;
}


function bnAbs(){
return this.s<0?this.negate():this;
}


function bnCompareTo(a){
var r=this.s-a.s;
if(r!=0)return r;
var i=this.t;
r=i-a.t;
if(r!=0)return this.s<0?-r:r;
while(--i>=0){
if((r=this[i]-a[i])!=0)return r;}
return 0;
}


function nbits(x){
var r=1,t;
if((t=x>>>16)!=0){
x=t;
r+=16;
}
if((t=x>>8)!=0){
x=t;
r+=8;
}
if((t=x>>4)!=0){
x=t;
r+=4;
}
if((t=x>>2)!=0){
x=t;
r+=2;
}
if((t=x>>1)!=0){
x=t;
r+=1;
}
return r;
}


function bnBitLength(){
if(this.t<=0)return 0;
return this.DB*(this.t-1)+nbits(this[this.t-1]^this.s&this.DM);
}


function bnpDLShiftTo(n,r){
var i;
for(i=this.t-1;i>=0;--i){
r[i+n]=this[i];}
for(i=n-1;i>=0;--i){
r[i]=0;}
r.t=this.t+n;
r.s=this.s;
}


function bnpDRShiftTo(n,r){
for(var i=n;i<this.t;++i){
r[i-n]=this[i];}
r.t=Math.max(this.t-n,0);
r.s=this.s;
}


function bnpLShiftTo(n,r){
var bs=n%this.DB;
var cbs=this.DB-bs;
var bm=(1<<cbs)-1;
var ds=Math.floor(n/this.DB),c=this.s<<bs&this.DM,i;
for(i=this.t-1;i>=0;--i){
r[i+ds+1]=this[i]>>cbs|c;
c=(this[i]&bm)<<bs;
}
for(i=ds-1;i>=0;--i){
r[i]=0;}
r[ds]=c;
r.t=this.t+ds+1;
r.s=this.s;
r.clamp();
}


function bnpRShiftTo(n,r){
r.s=this.s;
var ds=Math.floor(n/this.DB);
if(ds>=this.t){
r.t=0;
return;
}
var bs=n%this.DB;
var cbs=this.DB-bs;
var bm=(1<<bs)-1;
r[0]=this[ds]>>bs;
for(var i=ds+1;i<this.t;++i){
r[i-ds-1]|=(this[i]&bm)<<cbs;
r[i-ds]=this[i]>>bs;
}
if(bs>0)r[this.t-ds-1]|=(this.s&bm)<<cbs;
r.t=this.t-ds;
r.clamp();
}


function bnpSubTo(a,r){
var i=0,c=0,m=Math.min(a.t,this.t);
while(i<m){
c+=this[i]-a[i];
r[i++]=c&this.DM;
c>>=this.DB;
}
if(a.t<this.t){
c-=a.s;
while(i<this.t){
c+=this[i];
r[i++]=c&this.DM;
c>>=this.DB;
}
c+=this.s;
}else{
c+=this.s;
while(i<a.t){
c-=a[i];
r[i++]=c&this.DM;
c>>=this.DB;
}
c-=a.s;
}
r.s=c<0?-1:0;
if(c<-1)r[i++]=this.DV+c;else
if(c>0)r[i++]=c;
r.t=i;
r.clamp();
}



function bnpMultiplyTo(a,r){
var x=this.abs(),y=a.abs();
var i=x.t;
r.t=i+y.t;
while(--i>=0){
r[i]=0;}
for(i=0;i<y.t;++i){
r[i+x.t]=x.am(0,y[i],r,i,0,x.t);}
r.s=0;
r.clamp();
if(this.s!=a.s)BigInteger.ZERO.subTo(r,r);
}


function bnpSquareTo(r){
var x=this.abs();
var i=r.t=2*x.t;
while(--i>=0){
r[i]=0;}
for(i=0;i<x.t-1;++i){
var c=x.am(i,x[i],r,2*i,0,1);
if(
(r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1))>=
x.DV)
{
r[i+x.t]-=x.DV;
r[i+x.t+1]=1;
}
}
if(r.t>0)r[r.t-1]+=x.am(i,x[i],r,2*i,0,1);
r.s=0;
r.clamp();
}



function bnpDivRemTo(m,q,r){
var pm=m.abs();
if(pm.t<=0)return;
var pt=this.abs();
if(pt.t<pm.t){
if(q!=null)q.fromInt(0);
if(r!=null)this.copyTo(r);
return;
}
if(r==null)r=nbi();
var y=nbi(),ts=this.s,ms=m.s;
var nsh=this.DB-nbits(pm[pm.t-1]);

if(nsh>0){
pm.lShiftTo(nsh,y);
pt.lShiftTo(nsh,r);
}else{
pm.copyTo(y);
pt.copyTo(r);
}
var ys=y.t;
var y0=y[ys-1];
if(y0==0)return;
var yt=y0*(1<<this.F1)+(ys>1?y[ys-2]>>this.F2:0);
var d1=this.FV/yt,d2=(1<<this.F1)/yt,e=1<<this.F2;
var i=r.t,j=i-ys,t=q==null?nbi():q;
y.dlShiftTo(j,t);
if(r.compareTo(t)>=0){
r[r.t++]=1;
r.subTo(t,r);
}
BigInteger.ONE.dlShiftTo(ys,t);
t.subTo(y,y);

while(y.t<ys){
y[y.t++]=0;}
while(--j>=0){

var qd=r[--i]==y0?
this.DM:
Math.floor(r[i]*d1+(r[i-1]+e)*d2);
if((r[i]+=y.am(0,qd,r,j,0,ys))<qd){

y.dlShiftTo(j,t);
r.subTo(t,r);
while(r[i]<--qd){r.subTo(t,r);}
}
}
if(q!=null){
r.drShiftTo(ys,q);
if(ts!=ms)BigInteger.ZERO.subTo(q,q);
}
r.t=ys;
r.clamp();
if(nsh>0)r.rShiftTo(nsh,r);

if(ts<0)BigInteger.ZERO.subTo(r,r);
}


function bnMod(a){
var r=nbi();
this.abs().divRemTo(a,null,r);
if(this.s<0&&r.compareTo(BigInteger.ZERO)>0)a.subTo(r,r);
return r;
}











function bnpInvDigit(){
if(this.t<1)return 0;
var x=this[0];
if((x&1)==0)return 0;
var y=x&3;

y=y*(2-(x&0xf)*y)&0xf;

y=y*(2-(x&0xff)*y)&0xff;

y=y*(2-((x&0xffff)*y&0xffff))&0xffff;



y=y*(2-x*y%this.DV)%this.DV;


return y>0?this.DV-y:-y;
}

function bnEquals(a){
return this.compareTo(a)==0;
}


function bnpAddTo(a,r){
var i=0,c=0,m=Math.min(a.t,this.t);
while(i<m){
c+=this[i]+a[i];
r[i++]=c&this.DM;
c>>=this.DB;
}
if(a.t<this.t){
c+=a.s;
while(i<this.t){
c+=this[i];
r[i++]=c&this.DM;
c>>=this.DB;
}
c+=this.s;
}else{
c+=this.s;
while(i<a.t){
c+=a[i];
r[i++]=c&this.DM;
c>>=this.DB;
}
c+=a.s;
}
r.s=c<0?-1:0;
if(c>0)r[i++]=c;else
if(c<-1)r[i++]=this.DV+c;
r.t=i;
r.clamp();
}


function bnAdd(a){
var r=nbi();

this.addTo(a,r);

return r;
}


function bnSubtract(a){
var r=nbi();

this.subTo(a,r);

return r;
}


function bnMultiply(a){
var r=nbi();

this.multiplyTo(a,r);

return r;
}


function bnDivide(a){
var r=nbi();

this.divRemTo(a,r,null);

return r;
}


function Montgomery(m){
this.m=m;
this.mp=m.invDigit();
this.mpl=this.mp&0x7fff;
this.mph=this.mp>>15;
this.um=(1<<m.DB-15)-1;
this.mt2=2*m.t;
}


function montConvert(x){
var r=nbi();
x.abs().dlShiftTo(this.m.t,r);
r.divRemTo(this.m,null,r);
if(x.s<0&&r.compareTo(BigInteger.ZERO)>0)this.m.subTo(r,r);
return r;
}


function montRevert(x){
var r=nbi();
x.copyTo(r);
this.reduce(r);
return r;
}


function montReduce(x){
while(x.t<=this.mt2){

x[x.t++]=0;}
for(var i=0;i<this.m.t;++i){

var j=x[i]&0x7fff;
var u0=j*this.mpl+(
(j*this.mph+(x[i]>>15)*this.mpl&this.um)<<15)&
x.DM;

j=i+this.m.t;
x[j]+=this.m.am(0,u0,x,i,0,this.m.t);

while(x[j]>=x.DV){
x[j]-=x.DV;
x[++j]++;
}
}
x.clamp();
x.drShiftTo(this.m.t,x);
if(x.compareTo(this.m)>=0)x.subTo(this.m,x);
}


function montSqrTo(x,r){
x.squareTo(r);

this.reduce(r);
}


function montMulTo(x,y,r){
x.multiplyTo(y,r);

this.reduce(r);
}

Montgomery.prototype.convert=montConvert;
Montgomery.prototype.revert=montRevert;
Montgomery.prototype.reduce=montReduce;
Montgomery.prototype.mulTo=montMulTo;
Montgomery.prototype.sqrTo=montSqrTo;


function bnModPow(e,m){
var i=e.bitLength(),k,r=nbv(1),z=new Montgomery(m);
if(i<=0)return r;else
if(i<18)k=1;else
if(i<48)k=3;else
if(i<144)k=4;else
if(i<768)k=5;else
k=6;


var g=new Array(),n=3,k1=k-1,km=(1<<k)-1;
g[1]=z.convert(this);
if(k>1){
var g2=nbi();
z.sqrTo(g[1],g2);
while(n<=km){
g[n]=nbi();
z.mulTo(g2,g[n-2],g[n]);
n+=2;
}
}

var j=e.t-1,w,is1=true,r2=nbi(),t;
i=nbits(e[j])-1;
while(j>=0){
if(i>=k1)w=e[j]>>i-k1&km;else
{
w=(e[j]&(1<<i+1)-1)<<k1-i;
if(j>0)w|=e[j-1]>>this.DB+i-k1;
}

n=k;
while((w&1)==0){
w>>=1;
--n;
}
if((i-=n)<0){
i+=this.DB;
--j;
}
if(is1){

g[w].copyTo(r);
is1=false;
}else{
while(n>1){
z.sqrTo(r,r2);
z.sqrTo(r2,r);
n-=2;
}
if(n>0)z.sqrTo(r,r2);else
{
t=r;
r=r2;
r2=t;
}
z.mulTo(r2,g[w],r);
}

while(j>=0&&(e[j]&1<<i)==0){
z.sqrTo(r,r2);
t=r;
r=r2;
r2=t;
if(--i<0){
i=this.DB-1;
--j;
}
}
}
return z.revert(r);
}


BigInteger.prototype.copyTo=bnpCopyTo;
BigInteger.prototype.fromInt=bnpFromInt;
BigInteger.prototype.fromString=bnpFromString;
BigInteger.prototype.clamp=bnpClamp;
BigInteger.prototype.dlShiftTo=bnpDLShiftTo;
BigInteger.prototype.drShiftTo=bnpDRShiftTo;
BigInteger.prototype.lShiftTo=bnpLShiftTo;
BigInteger.prototype.rShiftTo=bnpRShiftTo;
BigInteger.prototype.subTo=bnpSubTo;
BigInteger.prototype.multiplyTo=bnpMultiplyTo;
BigInteger.prototype.squareTo=bnpSquareTo;
BigInteger.prototype.divRemTo=bnpDivRemTo;
BigInteger.prototype.invDigit=bnpInvDigit;
BigInteger.prototype.addTo=bnpAddTo;


BigInteger.prototype.toString=bnToString;
BigInteger.prototype.negate=bnNegate;
BigInteger.prototype.abs=bnAbs;
BigInteger.prototype.compareTo=bnCompareTo;
BigInteger.prototype.bitLength=bnBitLength;
BigInteger.prototype.mod=bnMod;
BigInteger.prototype.equals=bnEquals;
BigInteger.prototype.add=bnAdd;
BigInteger.prototype.subtract=bnSubtract;
BigInteger.prototype.multiply=bnMultiply;
BigInteger.prototype.divide=bnDivide;
BigInteger.prototype.modPow=bnModPow;


BigInteger.ZERO=nbv(0);
BigInteger.ONE=nbv(1);