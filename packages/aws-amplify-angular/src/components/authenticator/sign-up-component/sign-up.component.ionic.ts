import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { SignUpComponentCore } from './sign-up.component.core';

const template = `
<div class="amplify-authenticator" *ngIf="_show">
  <div class="amplify-form-body">
    <div class="amplify-form-header">Create a new account</div>
    <ion-list lines="none">
      <ion-item lines="none">
        <ion-label class="amplify-input-label" position="stacked">Username *</ion-label>
        <ion-input 
          #username
          type="text"
          class="amplify-form-input"
          (keyup)="setUsername($event.target.value)"
        ></ion-input>
      </ion-item>
    
      <ion-item lines="none">
        <ion-label class="amplify-input-label" position="stacked">Password *</ion-label>
        <ion-input 
          #password
          type="password"
          class="amplify-form-input"
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignUp()"
        ></ion-input>
      </ion-item>

      <ion-item lines="none">
        <ion-label class="amplify-input-label" position="stacked">Email *</ion-label>
        <ion-input 
          #email
          type="email"
          class="amplify-form-input"
          (keyup)="setEmail(email.value)"
        ></ion-input>
      </ion-item>

      <ion-label class="amplify-input-label push-right" position="stacked" style="margin-top:1.2em; margin-left:1.2em;">Phone Number *</ion-label>
      <ion-item lines="none">
        <ion-select #countryCode
        slot="start"
        name="countryCode" 
        class="amplify-select-phone-country" 
        (ionChange)="setCountryCode(countryCode.value)"
        [value]="country_code">
          <ion-select-option data-countryCode="US" value="1" Selected>USA (+1)</ion-select-option>
          <ion-select-option data-countryCode="GB" value="44">UK (+44)</ion-select-option>
          <ion-select-option data-countryCode="DZ" value="213">Algeria (+213)</ion-select-option>
          <ion-select-option data-countryCode="AD" value="376">Andorra (+376)</ion-select-option>
          <ion-select-option data-countryCode="AO" value="244">Angola (+244)</ion-select-option>
          <ion-select-option data-countryCode="AI" value="1264">Anguilla (+1264)</ion-select-option>
          <ion-select-option data-countryCode="AG" value="1268">Antigua &amp; Barbuda (+1268)</ion-select-option>
          <ion-select-option data-countryCode="AR" value="54">Argentina (+54)</ion-select-option>
          <ion-select-option data-countryCode="AM" value="374">Armenia (+374)</ion-select-option>
          <ion-select-option data-countryCode="AW" value="297">Aruba (+297)</ion-select-option>
          <ion-select-option data-countryCode="AU" value="61">Australia (+61)</ion-select-option>
          <ion-select-option data-countryCode="AT" value="43">Austria (+43)</ion-select-option>
          <ion-select-option data-countryCode="AZ" value="994">Azerbaijan (+994)</ion-select-option>
          <ion-select-option data-countryCode="BS" value="1242">Bahamas (+1242)</ion-select-option>
          <ion-select-option data-countryCode="BH" value="973">Bahrain (+973)</ion-select-option>
          <ion-select-option data-countryCode="BD" value="880">Bangladesh (+880)</ion-select-option>
          <ion-select-option data-countryCode="BB" value="1246">Barbados (+1246)</ion-select-option>
          <ion-select-option data-countryCode="BY" value="375">Belarus (+375)</ion-select-option>
          <ion-select-option data-countryCode="BE" value="32">Belgium (+32)</ion-select-option>
          <ion-select-option data-countryCode="BZ" value="501">Belize (+501)</ion-select-option>
          <ion-select-option data-countryCode="BJ" value="229">Benin (+229)</ion-select-option>
          <ion-select-option data-countryCode="BM" value="1441">Bermuda (+1441)</ion-select-option>
          <ion-select-option data-countryCode="BT" value="975">Bhutan (+975)</ion-select-option>
          <ion-select-option data-countryCode="BO" value="591">Bolivia (+591)</ion-select-option>
          <ion-select-option data-countryCode="BA" value="387">Bosnia Herzegovina (+387)</ion-select-option>
          <ion-select-option data-countryCode="BW" value="267">Botswana (+267)</ion-select-option>
          <ion-select-option data-countryCode="BR" value="55">Brazil (+55)</ion-select-option>
          <ion-select-option data-countryCode="BN" value="673">Brunei (+673)</ion-select-option>
          <ion-select-option data-countryCode="BG" value="359">Bulgaria (+359)</ion-select-option>
          <ion-select-option data-countryCode="BF" value="226">Burkina Faso (+226)</ion-select-option>
          <ion-select-option data-countryCode="BI" value="257">Burundi (+257)</ion-select-option>
          <ion-select-option data-countryCode="KH" value="855">Cambodia (+855)</ion-select-option>
          <ion-select-option data-countryCode="CM" value="237">Cameroon (+237)</ion-select-option>
          <ion-select-option data-countryCode="CA" value="1">Canada (+1)</ion-select-option>
          <ion-select-option data-countryCode="CV" value="238">Cape Verde Islands (+238)</ion-select-option>
          <ion-select-option data-countryCode="KY" value="1345">Cayman Islands (+1345)</ion-select-option>
          <ion-select-option data-countryCode="CF" value="236">Central African Republic (+236)</ion-select-option>
          <ion-select-option data-countryCode="CL" value="56">Chile (+56)</ion-select-option>
          <ion-select-option data-countryCode="CN" value="86">China (+86)</ion-select-option>
          <ion-select-option data-countryCode="CO" value="57">Colombia (+57)</ion-select-option>
          <ion-select-option data-countryCode="KM" value="269">Comoros (+269)</ion-select-option>
          <ion-select-option data-countryCode="CG" value="242">Congo (+242)</ion-select-option>
          <ion-select-option data-countryCode="CK" value="682">Cook Islands (+682)</ion-select-option>
          <ion-select-option data-countryCode="CR" value="506">Costa Rica (+506)</ion-select-option>
          <ion-select-option data-countryCode="HR" value="385">Croatia (+385)</ion-select-option>
          <ion-select-option data-countryCode="CU" value="53">Cuba (+53)</ion-select-option>
          <ion-select-option data-countryCode="CY" value="90392">Cyprus North (+90392)</ion-select-option>
          <ion-select-option data-countryCode="CY" value="357">Cyprus South (+357)</ion-select-option>
          <ion-select-option data-countryCode="CZ" value="42">Czech Republic (+42)</ion-select-option>
          <ion-select-option data-countryCode="DK" value="45">Denmark (+45)</ion-select-option>
          <ion-select-option data-countryCode="DJ" value="253">Djibouti (+253)</ion-select-option>
          <ion-select-option data-countryCode="DM" value="1809">Dominica (+1809)</ion-select-option>
          <ion-select-option data-countryCode="DO" value="1809">Dominican Republic (+1809)</ion-select-option>
          <ion-select-option data-countryCode="EC" value="593">Ecuador (+593)</ion-select-option>
          <ion-select-option data-countryCode="EG" value="20">Egypt (+20)</ion-select-option>
          <ion-select-option data-countryCode="SV" value="503">El Salvador (+503)</ion-select-option>
          <ion-select-option data-countryCode="GQ" value="240">Equatorial Guinea (+240)</ion-select-option>
          <ion-select-option data-countryCode="ER" value="291">Eritrea (+291)</ion-select-option>
          <ion-select-option data-countryCode="EE" value="372">Estonia (+372)</ion-select-option>
          <ion-select-option data-countryCode="ET" value="251">Ethiopia (+251)</ion-select-option>
          <ion-select-option data-countryCode="FK" value="500">Falkland Islands (+500)</ion-select-option>
          <ion-select-option data-countryCode="FO" value="298">Faroe Islands (+298)</ion-select-option>
          <ion-select-option data-countryCode="FJ" value="679">Fiji (+679)</ion-select-option>
          <ion-select-option data-countryCode="FI" value="358">Finland (+358)</ion-select-option>
          <ion-select-option data-countryCode="FR" value="33">France (+33)</ion-select-option>
          <ion-select-option data-countryCode="GF" value="594">French Guiana (+594)</ion-select-option>
          <ion-select-option data-countryCode="PF" value="689">French Polynesia (+689)</ion-select-option>
          <ion-select-option data-countryCode="GA" value="241">Gabon (+241)</ion-select-option>
          <ion-select-option data-countryCode="GM" value="220">Gambia (+220)</ion-select-option>
          <ion-select-option data-countryCode="GE" value="7880">Georgia (+7880)</ion-select-option>
          <ion-select-option data-countryCode="DE" value="49">Germany (+49)</ion-select-option>
          <ion-select-option data-countryCode="GH" value="233">Ghana (+233)</ion-select-option>
          <ion-select-option data-countryCode="GI" value="350">Gibraltar (+350)</ion-select-option>
          <ion-select-option data-countryCode="GR" value="30">Greece (+30)</ion-select-option>
          <ion-select-option data-countryCode="GL" value="299">Greenland (+299)</ion-select-option>
          <ion-select-option data-countryCode="GD" value="1473">Grenada (+1473)</ion-select-option>
          <ion-select-option data-countryCode="GP" value="590">Guadeloupe (+590)</ion-select-option>
          <ion-select-option data-countryCode="GU" value="671">Guam (+671)</ion-select-option>
          <ion-select-option data-countryCode="GT" value="502">Guatemala (+502)</ion-select-option>
          <ion-select-option data-countryCode="GN" value="224">Guinea (+224)</ion-select-option>
          <ion-select-option data-countryCode="GW" value="245">Guinea - Bissau (+245)</ion-select-option>
          <ion-select-option data-countryCode="GY" value="592">Guyana (+592)</ion-select-option>
          <ion-select-option data-countryCode="HT" value="509">Haiti (+509)</ion-select-option>
          <ion-select-option data-countryCode="HN" value="504">Honduras (+504)</ion-select-option>
          <ion-select-option data-countryCode="HK" value="852">Hong Kong (+852)</ion-select-option>
          <ion-select-option data-countryCode="HU" value="36">Hungary (+36)</ion-select-option>
          <ion-select-option data-countryCode="IS" value="354">Iceland (+354)</ion-select-option>
          <ion-select-option data-countryCode="IN" value="91">India (+91)</ion-select-option>
          <ion-select-option data-countryCode="ID" value="62">Indonesia (+62)</ion-select-option>
          <ion-select-option data-countryCode="IR" value="98">Iran (+98)</ion-select-option>
          <ion-select-option data-countryCode="IQ" value="964">Iraq (+964)</ion-select-option>
          <ion-select-option data-countryCode="IE" value="353">Ireland (+353)</ion-select-option>
          <ion-select-option data-countryCode="IL" value="972">Israel (+972)</ion-select-option>
          <ion-select-option data-countryCode="IT" value="39">Italy (+39)</ion-select-option>
          <ion-select-option data-countryCode="JM" value="1876">Jamaica (+1876)</ion-select-option>
          <ion-select-option data-countryCode="JP" value="81">Japan (+81)</ion-select-option>
          <ion-select-option data-countryCode="JO" value="962">Jordan (+962)</ion-select-option>
          <ion-select-option data-countryCode="KZ" value="7">Kazakhstan (+7)</ion-select-option>
          <ion-select-option data-countryCode="KE" value="254">Kenya (+254)</ion-select-option>
          <ion-select-option data-countryCode="KI" value="686">Kiribati (+686)</ion-select-option>
          <ion-select-option data-countryCode="KP" value="850">Korea North (+850)</ion-select-option>
          <ion-select-option data-countryCode="KR" value="82">Korea South (+82)</ion-select-option>
          <ion-select-option data-countryCode="KW" value="965">Kuwait (+965)</ion-select-option>
          <ion-select-option data-countryCode="KG" value="996">Kyrgyzstan (+996)</ion-select-option>
          <ion-select-option data-countryCode="LA" value="856">Laos (+856)</ion-select-option>
          <ion-select-option data-countryCode="LV" value="371">Latvia (+371)</ion-select-option>
          <ion-select-option data-countryCode="LB" value="961">Lebanon (+961)</ion-select-option>
          <ion-select-option data-countryCode="LS" value="266">Lesotho (+266)</ion-select-option>
          <ion-select-option data-countryCode="LR" value="231">Liberia (+231)</ion-select-option>
          <ion-select-option data-countryCode="LY" value="218">Libya (+218)</ion-select-option>
          <ion-select-option data-countryCode="LI" value="417">Liechtenstein (+417)</ion-select-option>
          <ion-select-option data-countryCode="LT" value="370">Lithuania (+370)</ion-select-option>
          <ion-select-option data-countryCode="LU" value="352">Luxembourg (+352)</ion-select-option>
          <ion-select-option data-countryCode="MO" value="853">Macao (+853)</ion-select-option>
          <ion-select-option data-countryCode="MK" value="389">Macedonia (+389)</ion-select-option>
          <ion-select-option data-countryCode="MG" value="261">Madagascar (+261)</ion-select-option>
          <ion-select-option data-countryCode="MW" value="265">Malawi (+265)</ion-select-option>
          <ion-select-option data-countryCode="MY" value="60">Malaysia (+60)</ion-select-option>
          <ion-select-option data-countryCode="MV" value="960">Maldives (+960)</ion-select-option>
          <ion-select-option data-countryCode="ML" value="223">Mali (+223)</ion-select-option>
          <ion-select-option data-countryCode="MT" value="356">Malta (+356)</ion-select-option>
          <ion-select-option data-countryCode="MH" value="692">Marshall Islands (+692)</ion-select-option>
          <ion-select-option data-countryCode="MQ" value="596">Martinique (+596)</ion-select-option>
          <ion-select-option data-countryCode="MR" value="222">Mauritania (+222)</ion-select-option>
          <ion-select-option data-countryCode="YT" value="269">Mayotte (+269)</ion-select-option>
          <ion-select-option data-countryCode="MX" value="52">Mexico (+52)</ion-select-option>
          <ion-select-option data-countryCode="FM" value="691">Micronesia (+691)</ion-select-option>
          <ion-select-option data-countryCode="MD" value="373">Moldova (+373)</ion-select-option>
          <ion-select-option data-countryCode="MC" value="377">Monaco (+377)</ion-select-option>
          <ion-select-option data-countryCode="MN" value="976">Mongolia (+976)</ion-select-option>
          <ion-select-option data-countryCode="MS" value="1664">Montserrat (+1664)</ion-select-option>
          <ion-select-option data-countryCode="MA" value="212">Morocco (+212)</ion-select-option>
          <ion-select-option data-countryCode="MZ" value="258">Mozambique (+258)</ion-select-option>
          <ion-select-option data-countryCode="MN" value="95">Myanmar (+95)</ion-select-option>
          <ion-select-option data-countryCode="NA" value="264">Namibia (+264)</ion-select-option>
          <ion-select-option data-countryCode="NR" value="674">Nauru (+674)</ion-select-option>
          <ion-select-option data-countryCode="NP" value="977">Nepal (+977)</ion-select-option>
          <ion-select-option data-countryCode="NL" value="31">Netherlands (+31)</ion-select-option>
          <ion-select-option data-countryCode="NC" value="687">New Caledonia (+687)</ion-select-option>
          <ion-select-option data-countryCode="NZ" value="64">New Zealand (+64)</ion-select-option>
          <ion-select-option data-countryCode="NI" value="505">Nicaragua (+505)</ion-select-option>
          <ion-select-option data-countryCode="NE" value="227">Niger (+227)</ion-select-option>
          <ion-select-option data-countryCode="NG" value="234">Nigeria (+234)</ion-select-option>
          <ion-select-option data-countryCode="NU" value="683">Niue (+683)</ion-select-option>
          <ion-select-option data-countryCode="NF" value="672">Norfolk Islands (+672)</ion-select-option>
          <ion-select-option data-countryCode="NP" value="670">Northern Marianas (+670)</ion-select-option>
          <ion-select-option data-countryCode="NO" value="47">Norway (+47)</ion-select-option>
          <ion-select-option data-countryCode="OM" value="968">Oman (+968)</ion-select-option>
          <ion-select-option data-countryCode="PW" value="680">Palau (+680)</ion-select-option>
          <ion-select-option data-countryCode="PA" value="507">Panama (+507)</ion-select-option>
          <ion-select-option data-countryCode="PG" value="675">Papua New Guinea (+675)</ion-select-option>
          <ion-select-option data-countryCode="PY" value="595">Paraguay (+595)</ion-select-option>
          <ion-select-option data-countryCode="PE" value="51">Peru (+51)</ion-select-option>
          <ion-select-option data-countryCode="PH" value="63">Philippines (+63)</ion-select-option>
          <ion-select-option data-countryCode="PL" value="48">Poland (+48)</ion-select-option>
          <ion-select-option data-countryCode="PT" value="351">Portugal (+351)</ion-select-option>
          <ion-select-option data-countryCode="PR" value="1787">Puerto Rico (+1787)</ion-select-option>
          <ion-select-option data-countryCode="QA" value="974">Qatar (+974)</ion-select-option>
          <ion-select-option data-countryCode="RE" value="262">Reunion (+262)</ion-select-option>
          <ion-select-option data-countryCode="RO" value="40">Romania (+40)</ion-select-option>
          <ion-select-option data-countryCode="RU" value="7">Russia (+7)</ion-select-option>
          <ion-select-option data-countryCode="RW" value="250">Rwanda (+250)</ion-select-option>
          <ion-select-option data-countryCode="SM" value="378">San Marino (+378)</ion-select-option>
          <ion-select-option data-countryCode="ST" value="239">Sao Tome &amp; Principe (+239)</ion-select-option>
          <ion-select-option data-countryCode="SA" value="966">Saudi Arabia (+966)</ion-select-option>
          <ion-select-option data-countryCode="SN" value="221">Senegal (+221)</ion-select-option>
          <ion-select-option data-countryCode="CS" value="381">Serbia (+381)</ion-select-option>
          <ion-select-option data-countryCode="SC" value="248">Seychelles (+248)</ion-select-option>
          <ion-select-option data-countryCode="SL" value="232">Sierra Leone (+232)</ion-select-option>
          <ion-select-option data-countryCode="SG" value="65">Singapore (+65)</ion-select-option>
          <ion-select-option data-countryCode="SK" value="421">Slovak Republic (+421)</ion-select-option>
          <ion-select-option data-countryCode="SI" value="386">Slovenia (+386)</ion-select-option>
          <ion-select-option data-countryCode="SB" value="677">Solomon Islands (+677)</ion-select-option>
          <ion-select-option data-countryCode="SO" value="252">Somalia (+252)</ion-select-option>
          <ion-select-option data-countryCode="ZA" value="27">South Africa (+27)</ion-select-option>
          <ion-select-option data-countryCode="ES" value="34">Spain (+34)</ion-select-option>
          <ion-select-option data-countryCode="LK" value="94">Sri Lanka (+94)</ion-select-option>
          <ion-select-option data-countryCode="SH" value="290">St. Helena (+290)</ion-select-option>
          <ion-select-option data-countryCode="KN" value="1869">St. Kitts (+1869)</ion-select-option>
          <ion-select-option data-countryCode="SC" value="1758">St. Lucia (+1758)</ion-select-option>
          <ion-select-option data-countryCode="SD" value="249">Sudan (+249)</ion-select-option>
          <ion-select-option data-countryCode="SR" value="597">Suriname (+597)</ion-select-option>
          <ion-select-option data-countryCode="SZ" value="268">Swaziland (+268)</ion-select-option>
          <ion-select-option data-countryCode="SE" value="46">Sweden (+46)</ion-select-option>
          <ion-select-option data-countryCode="CH" value="41">Switzerland (+41)</ion-select-option>
          <ion-select-option data-countryCode="SI" value="963">Syria (+963)</ion-select-option>
          <ion-select-option data-countryCode="TW" value="886">Taiwan (+886)</ion-select-option>
          <ion-select-option data-countryCode="TJ" value="7">Tajikstan (+7)</ion-select-option>
          <ion-select-option data-countryCode="TH" value="66">Thailand (+66)</ion-select-option>
          <ion-select-option data-countryCode="TG" value="228">Togo (+228)</ion-select-option>
          <ion-select-option data-countryCode="TO" value="676">Tonga (+676)</ion-select-option>
          <ion-select-option data-countryCode="TT" value="1868">Trinidad &amp; Tobago (+1868)</ion-select-option>
          <ion-select-option data-countryCode="TN" value="216">Tunisia (+216)</ion-select-option>
          <ion-select-option data-countryCode="TR" value="90">Turkey (+90)</ion-select-option>
          <ion-select-option data-countryCode="TM" value="7">Turkmenistan (+7)</ion-select-option>
          <ion-select-option data-countryCode="TM" value="993">Turkmenistan (+993)</ion-select-option>
          <ion-select-option data-countryCode="TC" value="1649">Turks &amp; Caicos Islands (+1649)</ion-select-option>
          <ion-select-option data-countryCode="TV" value="688">Tuvalu (+688)</ion-select-option>
          <ion-select-option data-countryCode="UG" value="256">Uganda (+256)</ion-select-option>
          <ion-select-option data-countryCode="UA" value="380">Ukraine (+380)</ion-select-option>
          <ion-select-option data-countryCode="AE" value="971">United Arab Emirates (+971)</ion-select-option>
          <ion-select-option data-countryCode="UY" value="598">Uruguay (+598)</ion-select-option>
          <ion-select-option data-countryCode="US" value="1">USA (+1)</ion-select-option>
          <ion-select-option data-countryCode="UZ" value="7">Uzbekistan (+7)</ion-select-option>
          <ion-select-option data-countryCode="VU" value="678">Vanuatu (+678)</ion-select-option>
          <ion-select-option data-countryCode="VA" value="379">Vatican City (+379)</ion-select-option>
          <ion-select-option data-countryCode="VE" value="58">Venezuela (+58)</ion-select-option>
          <ion-select-option data-countryCode="VN" value="84">Vietnam (+84)</ion-select-option>
          <ion-select-option data-countryCode="VG" value="84">Virgin Islands - British (+1284)</ion-select-option>
          <ion-select-option data-countryCode="VI" value="84">Virgin Islands - US (+1340)</ion-select-option>
          <ion-select-option data-countryCode="WF" value="681">Wallis &amp; Futuna (+681)</ion-select-option>
          <ion-select-option data-countryCode="YE" value="969">Yemen (North)(+969)</ion-select-option>
          <ion-select-option data-countryCode="YE" value="967">Yemen (South)(+967)</ion-select-option>
          <ion-select-option data-countryCode="ZM" value="260">Zambia (+260)</ion-select-option>
          <ion-select-option data-countryCode="ZW" value="263">Zimbabwe (+263)</ion-select-option>
        </ion-select>
        <ion-input 
          #phone_number
          type="tel"
          class="amplify-form-input"
          (keyup)="setPhoneNumber(phone_number.value)"
        ></ion-input>
      </ion-item>
    
    </ion-list>

    <div class="amplify-form-actions">
      <div>
        <ion-button expand="block" color="primary"
          (click)="onSignUp()"
        >Sign Up</ion-button>
      </div>
      <div class="amplify-form-cell-left">
        <div class="amplify-form-signup">Have an account? <a class="amplify-form-link" (click)="onSignIn()">Sign In</a></div>
      </div>
      <div class="amplify-form-cell-left">
        <div class="amplify-form-signup">Have an code? <a class="amplify-form-link" (click)="onConfirmSignUp()">Confirm</a></div>
      </div>
    </div>
  </div>

  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ errorMessage }}</div>
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
  </div>

</div>
`

@Component({
  selector: 'amplify-auth-sign-up-ionic',
  template: template
})
export class SignUpComponentIonic extends SignUpComponentCore {

  constructor(amplifyService: AmplifyService) {
    super(amplifyService)
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    alert(err.message || err);
  }

}
