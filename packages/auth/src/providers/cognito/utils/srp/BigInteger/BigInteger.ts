/* eslint-disable */
// @ts-nocheck -> BigInteger is already a vended utility
// A small implementation of BigInteger based on http://www-cs-students.stanford.edu/~tjw/jsbn/
//
// All public methods have been removed except the following:
//   new BigInteger(a, b) (only radix 2, 4, 8, 16 and 32 supported)
//   toString (only radix 2, 4, 8, 16 and 32 supported)
//   negate
//   abs
//   compareTo
//   bitLength
//   mod
//   equals
//   add
//   subtract
//   multiply
//   divide
//   modPow

import { AuthBigInteger } from './types';

export default BigInteger as AuthBigInteger;

interface BNP {
	s: number;
	t: number;
}
/*
 * Copyright (c) 2003-2005  Tom Wu
 * All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * In addition, the following condition applies:
 *
 * All redistributions must retain an intact copy of this copyright notice
 * and disclaimer.
 */

// (public) Constructor
function BigInteger(a?: any, b?: any) {
	if (a != null) this.fromString(a, b);
}

// return new, unset BigInteger
function nbi() {
	return new BigInteger(null, null);
}

// Bits per digit
let dbits: number;

// JavaScript engine analysis
const canary = 0xdeadbeefcafe;
const j_lm = (canary & 0xffffff) === 0xefcafe;

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(
	i: number,
	x: number,
	w: number,
	j: number,
	c: number,
	n: number,
): number {
	while (--n >= 0) {
		const v = x * this[i++] + w[j] + c;
		c = Math.floor(v / 0x4000000);
		w[j++] = v & 0x3ffffff;
	}

	return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(
	i: number,
	x: number,
	w: number,
	j: number,
	c: number,
	n: number,
): number {
	const xl = x & 0x7fff;
	const xh = x >> 15;
	while (--n >= 0) {
		let l = this[i] & 0x7fff;
		const h = this[i++] >> 15;
		const m = xh * l + h * xl;
		l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
		c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
		w[j++] = l & 0x3fffffff;
	}

	return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(
	i: number,
	x: number,
	w: number,
	j: number,
	c: number,
	n: number,
): number {
	const xl = x & 0x3fff;
	const xh = x >> 14;
	while (--n >= 0) {
		let l = this[i] & 0x3fff;
		const h = this[i++] >> 14;
		const m = xh * l + h * xl;
		l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
		c = (l >> 28) + (m >> 14) + xh * h;
		w[j++] = l & 0xfffffff;
	}

	return c;
}
const inBrowser = typeof navigator !== 'undefined';
if (inBrowser && j_lm && navigator.appName === 'Microsoft Internet Explorer') {
	BigInteger.prototype.am = am2;
	dbits = 30;
} else if (inBrowser && j_lm && navigator.appName !== 'Netscape') {
	BigInteger.prototype.am = am1;
	dbits = 26;
} else {
	// Mozilla/Netscape seems to prefer am3
	BigInteger.prototype.am = am3;
	dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = (1 << dbits) - 1;
BigInteger.prototype.DV = 1 << dbits;

const BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2, BI_FP);
BigInteger.prototype.F1 = BI_FP - dbits;
BigInteger.prototype.F2 = 2 * dbits - BI_FP;

// Digit conversions
const BI_RM = '0123456789abcdefghijklmnopqrstuvwxyz';
const BI_RC = [];
let rr: number, vv: number;
rr = '0'.charCodeAt(0);
for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = 'a'.charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = 'A'.charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n: number): string {
	return BI_RM.charAt(n);
}
function intAt(s: string, i: number): number {
	const c = BI_RC[s.charCodeAt(i)];

	return c == null ? -1 : c;
}

// (protected) copy this to r
function bnpCopyTo(r: { t: number; s: number }): void {
	for (let i = this.t - 1; i >= 0; --i) r[i] = this[i];
	r.t = this.t;
	r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x: number): void {
	this.t = 1;
	this.s = x < 0 ? -1 : 0;
	if (x > 0) this[0] = x;
	else if (x < -1) this[0] = x + this.DV;
	else this.t = 0;
}

// return bigint initialized to value
function nbv(i: number) {
	const r = nbi();

	r.fromInt(i);

	return r;
}

// (protected) set from string and radix
function bnpFromString(s: string, b: number): void {
	let k: number;
	if (b === 16) k = 4;
	else if (b === 8) k = 3;
	else if (b === 2) k = 1;
	else if (b === 32) k = 5;
	else if (b === 4) k = 2;
	else throw new Error('Only radix 2, 4, 8, 16, 32 are supported');
	this.t = 0;
	this.s = 0;
	let i = s.length;
	let mi = false;
	let sh = 0;
	while (--i >= 0) {
		const x = intAt(s, i);
		if (x < 0) {
			if (s.charAt(i) === '-') mi = true;
			continue;
		}
		mi = false;
		if (sh === 0) this[this.t++] = x;
		else if (sh + k > this.DB) {
			this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
			this[this.t++] = x >> (this.DB - sh);
		} else this[this.t - 1] |= x << sh;
		sh += k;
		if (sh >= this.DB) sh -= this.DB;
	}
	this.clamp();
	if (mi) BigInteger.ZERO.subTo(this, this);
}

// (protected) clamp off excess high words
function bnpClamp(): void {
	const c = this.s & this.DM;
	while (this.t > 0 && this[this.t - 1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b: number): string {
	if (this.s < 0) return '-' + this.negate().toString(b);
	let k: number;
	if (b == 16) k = 4;
	else if (b === 8) k = 3;
	else if (b === 2) k = 1;
	else if (b === 32) k = 5;
	else if (b === 4) k = 2;
	else throw new Error('Only radix 2, 4, 8, 16, 32 are supported');
	const km = (1 << k) - 1;
	let d: number;
	let m = false;
	let r = '';
	let i = this.t;
	let p = this.DB - ((i * this.DB) % k);
	if (i-- > 0) {
		if (p < this.DB && (d = this[i] >> p) > 0) {
			m = true;
			r = int2char(d);
		}
		while (i >= 0) {
			if (p < k) {
				d = (this[i] & ((1 << p) - 1)) << (k - p);
				d |= this[--i] >> (p += this.DB - k);
			} else {
				d = (this[i] >> (p -= k)) & km;
				if (p <= 0) {
					p += this.DB;
					--i;
				}
			}
			if (d > 0) m = true;
			if (m) r += int2char(d);
		}
	}

	return m ? r : '0';
}

// (public) -this
function bnNegate() {
	const r = nbi();

	BigInteger.ZERO.subTo(this, r);

	return r;
}

// (public) |this|
function bnAbs() {
	return this.s < 0 ? this.negate() : this;
}

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a: BNP): number {
	let r = this.s - a.s;
	if (r != 0) return r;
	let i = this.t;
	r = i - a.t;
	if (r != 0) return this.s < 0 ? -r : r;
	while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;

	return 0;
}

// returns bit length of the integer x
function nbits(x: number): number {
	let r = 1;
	let t: number;
	if ((t = x >>> 16) !== 0) {
		x = t;
		r += 16;
	}
	if ((t = x >> 8) !== 0) {
		x = t;
		r += 8;
	}
	if ((t = x >> 4) !== 0) {
		x = t;
		r += 4;
	}
	if ((t = x >> 2) !== 0) {
		x = t;
		r += 2;
	}
	if ((t = x >> 1) !== 0) {
		x = t;
		r += 1;
	}

	return r;
}

// (public) return the number of bits in "this"
function bnBitLength(): number {
	if (this.t <= 0) return 0;

	return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n: number, r: BNP) {
	let i: number;
	for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
	for (i = n - 1; i >= 0; --i) r[i] = 0;
	r.t = this.t + n;
	r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n: number, r: BNP): void {
	for (let i = n; i < this.t; ++i) r[i - n] = this[i];
	r.t = Math.max(this.t - n, 0);
	r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(
	n: number,
	r: { s: number; t: number; clamp: Function },
): void {
	const bs = n % this.DB;
	const cbs = this.DB - bs;
	const bm = (1 << cbs) - 1;
	const ds = Math.floor(n / this.DB);
	let c = (this.s << bs) & this.DM;
	let i;
	for (i = this.t - 1; i >= 0; --i) {
		r[i + ds + 1] = (this[i] >> cbs) | c;
		c = (this[i] & bm) << bs;
	}
	for (i = ds - 1; i >= 0; --i) r[i] = 0;
	r[ds] = c;
	r.t = this.t + ds + 1;
	r.s = this.s;
	r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n: number, r: BNP & { clamp: Function }): void {
	r.s = this.s;
	const ds = Math.floor(n / this.DB);
	if (ds >= this.t) {
		r.t = 0;

		return;
	}
	const bs = n % this.DB;
	const cbs = this.DB - bs;
	const bm = (1 << bs) - 1;
	r[0] = this[ds] >> bs;
	for (let i = ds + 1; i < this.t; ++i) {
		r[i - ds - 1] |= (this[i] & bm) << cbs;
		r[i - ds] = this[i] >> bs;
	}
	if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
	r.t = this.t - ds;
	r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a: BNP, r: BNP & { clamp: Function }): void {
	let i = 0;
	let c = 0;
	const m = Math.min(a.t, this.t);
	while (i < m) {
		c += this[i] - a[i];
		r[i++] = c & this.DM;
		c >>= this.DB;
	}
	if (a.t < this.t) {
		c -= a.s;
		while (i < this.t) {
			c += this[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		c += this.s;
	} else {
		c += this.s;
		while (i < a.t) {
			c -= a[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		c -= a.s;
	}
	r.s = c < 0 ? -1 : 0;
	if (c < -1) r[i++] = this.DV + c;
	else if (c > 0) r[i++] = c;
	r.t = i;
	r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(
	a: BNP & { abs: Function },
	r: BNP & { clamp: Function },
): void {
	const x = this.abs();
	const y = a.abs();
	let i = x.t;
	r.t = i + y.t;
	while (--i >= 0) r[i] = 0;
	for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
	r.s = 0;
	r.clamp();
	if (this.s !== a.s) BigInteger.ZERO.subTo(r, r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
	const x = this.abs();
	let i = (r.t = 2 * x.t);
	while (--i >= 0) r[i] = 0;
	for (i = 0; i < x.t - 1; ++i) {
		const c = x.am(i, x[i], r, 2 * i, 0, 1);
		if (
			(r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >=
			x.DV
		) {
			r[i + x.t] -= x.DV;
			r[i + x.t + 1] = 1;
		}
	}
	if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
	r.s = 0;
	r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(
	m: BNP & { abs: Function },
	q: { fromInt: Function },
	r: BNP & {
		compareTo: Function;
		subTo: Function;
		drShiftTo: Function;
		clamp: Function;
		rShiftTo: Function;
	},
): void {
	const pm = m.abs();
	if (pm.t <= 0) return;
	const pt = this.abs();
	if (pt.t < pm.t) {
		if (q != null) q.fromInt(0);
		if (r != null) this.copyTo(r);

		return;
	}
	if (r === null) r = nbi();
	const y = nbi();
	const ts = this.s;
	const ms = m.s;
	const nsh = this.DB - nbits(pm[pm.t - 1]);
	// normalize modulus
	if (nsh > 0) {
		pm.lShiftTo(nsh, y);
		pt.lShiftTo(nsh, r);
	} else {
		pm.copyTo(y);
		pt.copyTo(r);
	}
	const ys = y.t;
	const y0 = y[ys - 1];
	if (y0 === 0) return;
	const yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
	const d1 = this.FV / yt;
	const d2 = (1 << this.F1) / yt;
	const e = 1 << this.F2;
	let i = r.t;
	let j = i - ys;
	const t = q === null ? nbi() : q;
	y.dlShiftTo(j, t);
	if (r.compareTo(t) >= 0) {
		r[r.t++] = 1;
		r.subTo(t, r);
	}
	BigInteger.ONE.dlShiftTo(ys, t);
	t.subTo(y, y);
	// "negative" y so we can replace sub with am later
	while (y.t < ys) y[y.t++] = 0;
	while (--j >= 0) {
		// Estimate quotient digit
		let qd =
			r[--i] === y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
		if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
			// Try it out
			y.dlShiftTo(j, t);
			r.subTo(t, r);
			while (r[i] < --qd) r.subTo(t, r);
		}
	}
	if (q !== null) {
		r.drShiftTo(ys, q);
		if (ts !== ms) BigInteger.ZERO.subTo(q, q);
	}
	r.t = ys;
	r.clamp();
	if (nsh > 0) r.rShiftTo(nsh, r);
	// Denormalize remainder
	if (ts < 0) BigInteger.ZERO.subTo(r, r);
}

// (public) this mod a
function bnMod(a) {
	const r = nbi();
	this.abs().divRemTo(a, null, r);
	if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);

	return r;
}

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit(): number {
	if (this.t < 1) return 0;
	const x = this[0];
	if ((x & 1) === 0) return 0;
	let y = x & 3;
	// y == 1/x mod 2^2
	y = (y * (2 - (x & 0xf) * y)) & 0xf;
	// y == 1/x mod 2^4
	y = (y * (2 - (x & 0xff) * y)) & 0xff;
	// y == 1/x mod 2^8
	y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;
	// y == 1/x mod 2^16
	// last step - calculate inverse mod DV directly;
	// assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
	y = (y * (2 - ((x * y) % this.DV))) % this.DV;

	// y == 1/x mod 2^dbits
	// we really want the negative inverse, and -DV < y < DV
	return y > 0 ? this.DV - y : -y;
}

function bnEquals(a: number): boolean {
	return this.compareTo(a) === 0;
}

// (protected) r = this + a
function bnpAddTo(a: BNP, r: BNP & { clamp: Function }): void {
	let i = 0;
	let c = 0;
	const m = Math.min(a.t, this.t);
	while (i < m) {
		c += this[i] + a[i];
		r[i++] = c & this.DM;
		c >>= this.DB;
	}
	if (a.t < this.t) {
		c += a.s;
		while (i < this.t) {
			c += this[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		c += this.s;
	} else {
		c += this.s;
		while (i < a.t) {
			c += a[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		c += a.s;
	}
	r.s = c < 0 ? -1 : 0;
	if (c > 0) r[i++] = c;
	else if (c < -1) r[i++] = this.DV + c;
	r.t = i;
	r.clamp();
}

// (public) this + a
function bnAdd(a: number) {
	const r = nbi();

	this.addTo(a, r);

	return r;
}

// (public) this - a
function bnSubtract(a: number): number {
	const r = nbi();

	this.subTo(a, r);

	return r;
}

// (public) this * a
function bnMultiply(a: number): number {
	const r = nbi();

	this.multiplyTo(a, r);

	return r;
}

// (public) this / a
function bnDivide(a: number): number {
	const r = nbi();

	this.divRemTo(a, r, null);

	return r;
}

// Montgomery reduction
function Montgomery(m: { invDigit: Function; DB: number; t: number }): void {
	this.m = m;
	this.mp = m.invDigit();
	this.mpl = this.mp & 0x7fff;
	this.mph = this.mp >> 15;
	this.um = (1 << (m.DB - 15)) - 1;
	this.mt2 = 2 * m.t;
}

// xR mod m
function montConvert(x: BNP & { abs: Function }): number {
	const r = nbi();
	x.abs().dlShiftTo(this.m.t, r);
	r.divRemTo(this.m, null, r);
	if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);

	return r;
}

// x/R mod m
function montRevert(x: { copyTo: Function }): number {
	const r = nbi();
	x.copyTo(r);
	this.reduce(r);

	return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x: {
	t: number;
	clamp: Function;
	drShiftTo: Function;
	compareTo: Function;
	subTo: Function;
	DV: number;
	DM: number;
}): void {
	while (x.t <= this.mt2)
		// pad x so am has enough room later
		x[x.t++] = 0;
	for (let i = 0; i < this.m.t; ++i) {
		// faster way of calculating u0 = x[i]*mp mod DV
		let j = x[i] & 0x7fff;
		const u0 =
			(j * this.mpl +
				(((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) &
			x.DM;
		// use am to combine the multiply-shift-add into one call
		j = i + this.m.t;
		x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
		// propagate carry
		while (x[j] >= x.DV) {
			x[j] -= x.DV;
			x[++j]++;
		}
	}
	x.clamp();
	x.drShiftTo(this.m.t, x);
	if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x: { squareTo: Function }, r: number) {
	x.squareTo(r);

	this.reduce(r);
}

// r = "xy/R mod m"; x,y != r
function montMulTo(x: { multiplyTo: Function }, y: number, r: number) {
	x.multiplyTo(y, r);

	this.reduce(r);
}

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (public) this^e % m (HAC 14.85)
function bnModPow(
	e: { bitLength: Function; t: number },
	m: {
		invDigit: Function;
		DB: number;
		t: number;
	},
	callback: Function,
) {
	let i = e.bitLength();
	let k: number;
	let r = nbv(1);
	const z = new Montgomery(m);
	if (i <= 0) return r;
	else if (i < 18) k = 1;
	else if (i < 48) k = 3;
	else if (i < 144) k = 4;
	else if (i < 768) k = 5;
	else k = 6;

	// precomputation
	const g = [];
	let n = 3;
	const k1 = k - 1;
	const km = (1 << k) - 1;
	g[1] = z.convert(this);
	if (k > 1) {
		const g2 = nbi();
		z.sqrTo(g[1], g2);
		while (n <= km) {
			g[n] = nbi();
			z.mulTo(g2, g[n - 2], g[n]);
			n += 2;
		}
	}

	let j = e.t - 1;
	let w: number;
	let is1 = true;
	let r2 = nbi();
	let t: number;
	i = nbits(e[j]) - 1;
	while (j >= 0) {
		if (i >= k1) w = (e[j] >> (i - k1)) & km;
		else {
			w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
			if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
		}

		n = k;
		while ((w & 1) === 0) {
			w >>= 1;
			--n;
		}
		if ((i -= n) < 0) {
			i += this.DB;
			--j;
		}
		if (is1) {
			// ret == 1, don't bother squaring or multiplying it
			g[w].copyTo(r);
			is1 = false;
		} else {
			while (n > 1) {
				z.sqrTo(r, r2);
				z.sqrTo(r2, r);
				n -= 2;
			}
			if (n > 0) z.sqrTo(r, r2);
			else {
				t = r;
				r = r2;
				r2 = t;
			}
			z.mulTo(r2, g[w], r);
		}

		while (j >= 0 && (e[j] & (1 << i)) === 0) {
			z.sqrTo(r, r2);
			t = r;
			r = r2;
			r2 = t;
			if (--i < 0) {
				i = this.DB - 1;
				--j;
			}
		}
	}
	const result = z.revert(r);
	callback(null, result);

	return result;
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.addTo = bnpAddTo;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.modPow = bnModPow;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);
