import React, { Component } from 'react'
import Cookies from 'js-cookie'
import { default as Countries } from '../../../../util/jsonFiles/countries.json';
import { ChildSingleInput } from '../Form/SingleInput.jsx';
import { Button, Modal, Header, Form, Select, Grid } from 'semantic-ui-react'
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import { countryOptions } from '../Employer/common.js';

export class Address extends Component {
    constructor(props) {
        super(props)

        const addressData = props.addressData ?
            Object.assign({}, props.addressData)
            : {
                number: "",
                street: "",
                suburb: "",
                postCode: "",
                country: "",
                city: "",
                region: ""
            }

        

        this.state = {
            showEditSection: false,
            newaddressData: addressData
        }
        
       // console.log("Location Constructor",this.state.newaddressData);
        
        this.openEdit = this.openEdit.bind(this)
        this.closeEdit = this.closeEdit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.saveaddressData = this.saveaddressData.bind(this)
        this.renderEdit = this.renderEdit.bind(this)
        this.renderDisplay = this.renderDisplay.bind(this)
    }

    selectCountry(val) {
        this.setState({ country: val });
        //console.log("Country:" + val);
        let event = {
            target: {
                name: "country",
                value: val
            }
        }
        this.handleChange(event);
    }

    selectRegion(val) {
        this.setState({ region: val });
        //console.log("City:" + val);
        let event = {
            target: {
                name: "city",
                value: val
            }
        }
        this.handleChange(event);
    }

    

    openEdit() {
        const addressData = Object.assign({}, this.props.addressData)
        this.setState({
            showEditSection: true,
            newaddressData: addressData
        })
       // console.log("Open Edit details" + this.state.newaddressData)
    }

    closeEdit() {
        this.setState({
            showEditSection: false
        })
    }

    handleChange(event) {
        const data = Object.assign({}, this.state.newaddressData)
        data[event.target.name] = event.target.value
        this.setState({
            newaddressData: data
        })
        
    }

    saveaddressData() {
       // console.log(this.props.componentId)
        //console.log(this.state.newaddressData)
        const data = Object.assign({}, this.state.newaddressData)
       // this.props.controlFunc(this.props.componentId, data)
        this.props.updateProfileData({ address: data })
        this.props.saveProfileData({ address: data })

        this.closeEdit()
    }

    render() {
        return (
            this.state.showEditSection ? this.renderEdit() : this.renderDisplay()
        )
    }

    renderEdit() {

        const { country, region } = this.state;

        let countriesOptions = [];
        let citiesOptions = [];
        const selectedCountry = this.state.newaddressData.country;
        const selectedCity = this.state.newaddressData.city;

        countriesOptions = Object.keys(Countries).map((x) => <option key={x} value={x}>{x}</option>);

        if (selectedCountry != "" && selectedCountry != null) {

            var popCities = Countries[selectedCountry].map(x => <option key={x} value={x}> {x}</option>);

            citiesOptions = <span><select
                className="ui dropdown"
                placeholder="City"
                value={selectedCity}
                onChange={this.handleChange}
                name="city">
                <option value="0"> Select a town or city</option>
                {popCities}
            </select><br /></span>

        }

        return (
            <div className='ui sixteen wide column'>
                <React.Fragment>
                    <Form>
                        <Form.Group widths='equal'>
                            <ChildSingleInput
                                inputType="text"
                                label="Number"
                                name="number"
                                value={this.state.newaddressData.number}
                                controlFunc={this.handleChange}
                                maxLength={80}
                                placeholder="Enter your Door no"
                                errorMessage="Please enter a valid door no"
                            />
                            <ChildSingleInput
                                inputType="text"
                                label="Street"
                                name="street"
                                value={this.state.newaddressData.street}
                                controlFunc={this.handleChange}
                                maxLength={80}
                                placeholder="Enter your street"
                                errorMessage="Please enter a valid street details"
                            />
                            <ChildSingleInput
                                inputType="text"
                                label="Suburb"
                                name="suburb"
                                value={this.state.newaddressData.suburb}
                                controlFunc={this.handleChange}
                                maxLength={80}
                                placeholder="Enter Suburb details"
                                errorMessage="Please enter a valid suburb details"
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <div className="field">
                                <label>Country</label>
                                <select className="ui right labeled dropdown"

                                    placeholder=""
                                    value={selectedCountry}
                                    onChange={this.handleChange}
                                    name="country" width={4}>

                                    <option value="">Select a country</option>
                                    {countriesOptions}
                                </select>
                            </div>

                            <div className="field"> <label> City</label>
                                <select
                                    className="ui right labeled dropdown"
                                    placeholder="City"
                                    value={selectedCity}
                                    onChange={this.handleChange}
                                    name="city" width={8}>
                                    <option value="0"> Select a town or city</option>
                                    {popCities}
                                </select>
                            </div>
                            
                            <ChildSingleInput
                                    inputType="text"
                                    label="PostCode"
                                    name="postCode"
                                    value={this.state.newaddressData.postCode}
                                    controlFunc={this.handleChange}
                                    maxLength={80}
                                    placeholder="Enter postcode"
                                    errorMessage="Please enter a valid postcode details"
                                />
                            

                        </Form.Group>
                        <button type="button" className="ui teal button" onClick={this.saveaddressData}>Save</button>
                        <button type="button" className="ui button" onClick={this.closeEdit}>Cancel</button>
                    </Form>
                </React.Fragment>
            </div>
        )
    }

    renderDisplay() {

        let fullAddress = this.props.addressData ? `${this.props.addressData.number} ${this.props.addressData.street} ${this.props.addressData.suburb}  ${this.props.addressData.postCode}` : ""
       // console.log("Address Display",fullAddress);
        
        return (
            <div className='row'>
                <div className="ui sixteen wide column">
                    <React.Fragment>
                        <p>Address: {fullAddress} </p>
                        <p>City:{this.props.addressData.city}</p>
                        <p>Country:{this.props.addressData.country}</p>
                    </React.Fragment>
                    <button type="button" className="ui right floated teal button" onClick={this.openEdit}>Edit</button>
                </div>
            </div>
        )
    }
}

export class Nationality extends React.Component {
    constructor(props) {
        super(props)

        const nationalityData = props.nationalityData ?
            Object.assign({}, props.nationalityData)
            : "";

        this.state = {
            showEditSection: false,
            newnationalityData: nationalityData
        }

        this.openEdit = this.openEdit.bind(this)

        this.changevalue = this.changevalue.bind(this);
    }

    changevalue(value) {

       // console.log("Entered in the national-change-function:" + value);

        this.setState({
            newnationalityData: value
        })

       // console.log("After setting the status: " + this.state.newnationalityData);
    }

    saveNationality() {
        const data = Object.assign({}, this.state.newnationalityData)
        //console.log("New Nationality Data",this.state.newnationalityData);
        this.props.saveProfileData({ nationality: this.state.newnationalityData })
        this.setState({
            showEditSection: false
        })

    }

    openEdit() {
        const nationalityData = Object.assign({}, this.props.nationalityData)
       // console.log("Open Edit Values:" + this.props.nationalityData);
        this.setState({
            showEditSection: true
        })
        this.state = {
            newnationalityData: nationalityData
        }
        //console.log("Open Edit Values:" + this.state.newnationalityData);
    }

    render() {
        return (
            this.state.showEditSection ? this.renderEdit() : this.renderDisplay()
        )
    }
    
    renderDisplay() {

        const nationality = [
            "Afghan",
            "Albanian",
            "Algerian",
            "American",
            "Andorran",
            "Angolan",
            "Antiguans",
            "Argentinean",
            "Armenian",
            "Australian",
            "Austrian",
            "Azerbaijani",
            "Bahamian",
            "Bahraini",
            "Bangladeshi",
            "Barbadian",
            "Barbudans",
            "Batswana",
            "Belarusian",
            "Belgian",
            "Belizean",
            "Beninese",
            "Bhutanese",
            "Bolivian",
            "Bosnian",
            "Brazilian",
            "British",
            "Bruneian",
            "Bulgarian",
            "Burkinabe",
            "Burmese",
            "Burundian",
            "Cambodian",
            "Cameroonian",
            "Canadian",
            "Cape Verdean",
            "Central African",
            "Chadian",
            "Chilean",
            "Chinese",
            "Colombian",
            "Comoran",
            "Congolese",
            "Costa Rican",
            "Croatian",
            "Cuban",
            "Cypriot",
            "Czech",
            "Danish",
            "Djibouti",
            "Dominican",
            "Dutch",
            "East Timorese",
            "Ecuadorean",
            "Egyptian",
            "Emirian",
            "Equatorial Guinean",
            "Eritrean",
            "Estonian",
            "Ethiopian",
            "Fijian",
            "Filipino",
            "Finnish",
            "French",
            "Gabonese",
            "Gambian",
            "Georgian",
            "German",
            "Ghanaian",
            "Greek",
            "Grenadian",
            "Guatemalan",
            "Guinea-Bissauan",
            "Guinean",
            "Guyanese",
            "Haitian",
            "Herzegovinian",
            "Honduran",
            "Hungarian",
            "I-Kiribati",
            "Icelander",
            "Indian",
            "Indonesian",
            "Iranian",
            "Iraqi",
            "Irish",
            "Israeli",
            "Italian",
            "Ivorian",
            "Jamaican",
            "Japanese",
            "Jordanian",
            "Kazakhstani",
            "Kenyan",
            "Kittian and Nevisian",
            "Kuwaiti",
            "Kyrgyz",
            "Laotian",
            "Latvian",
            "Lebanese",
            "Liberian",
            "Libyan",
            "Liechtensteiner",
            "Lithuanian",
            "Luxembourger",
            "Macedonian",
            "Malagasy",
            "Malawian",
            "Malaysian",
            "Maldivan",
            "Malian",
            "Maltese",
            "Marshallese",
            "Mauritanian",
            "Mauritian",
            "Mexican",
            "Micronesian",
            "Moldovan",
            "Monacan",
            "Mongolian",
            "Moroccan",
            "Mosotho",
            "Motswana",
            "Mozambican",
            "Namibian",
            "Nauruan",
            "Nepalese",
            "New Zealander",
            "Nicaraguan",
            "Nigerian",
            "Nigerien",
            "North Korean",
            "Northern Irish",
            "Norwegian",
            "Omani",
            "Pakistani",
            "Palauan",
            "Panamanian",
            "Papua New Guinean",
            "Paraguayan",
            "Peruvian",
            "Polish",
            "Portuguese",
            "Qatari",
            "Romanian",
            "Russian",
            "Rwandan",
            "Saint Lucian",
            "Salvadoran",
            "Samoan",
            "San Marinese",
            "Sao Tomean",
            "Saudi",
            "Scottish",
            "Senegalese",
            "Serbian",
            "Seychellois",
            "Sierra Leonean",
            "Singaporean",
            "Slovakian",
            "Slovenian",
            "Solomon Islander",
            "Somali",
            "South African",
            "South Korean",
            "Spanish",
            "Sri Lankan",
            "Sudanese",
            "Surinamer",
            "Swazi",
            "Swedish",
            "Swiss",
            "Syrian",
            "Taiwanese",
            "Tajik",
            "Tanzanian",
            "Thai",
            "Togolese",
            "Tongan",
            "Trinidadian or Tobagonian",
            "Tunisian",
            "Turkish",
            "Tuvaluan",
            "Ugandan",
            "Ukrainian",
            "Uruguayan",
            "Uzbekistani",
            "Venezuelan",
            "Vietnamese",
            "Welsh",
            "Yemenite",
            "Zambian",
            "Zimbabwean"
        ]

        const nationalityOptions = nationality.map(nation => ({
            key: nation,
            text: nation,
            value: nation,

        }));

       // console.log("Nationality Render Display:" + this.props.nationalityData);
        return (
            <div className='row'>
                <div className="ui sixteen wide column" >
                    <React.Fragment>
                        
                            <Form.Group>
                                <Form.Select
                                    fixed
                                    search
                                    selection
                                    options={nationalityOptions}
                                    value={this.props.nationalityData}
                                    placeholder="Select your Nationality"
                                    onClick={this.openEdit.bind(this)}
                                />
                            </Form.Group>
                        

                    </React.Fragment>
                    <button type="button" className="ui teal button" onClick={this.saveNationality.bind(this)}>Save</button>
                </div>
            </div>
            
            );
        
    }

    renderEdit() {

        const nationality = [
            "Afghan",
            "Albanian",
            "Algerian",
            "American",
            "Andorran",
            "Angolan",
            "Antiguans",
            "Argentinean",
            "Armenian",
            "Australian",
            "Austrian",
            "Azerbaijani",
            "Bahamian",
            "Bahraini",
            "Bangladeshi",
            "Barbadian",
            "Barbudans",
            "Batswana",
            "Belarusian",
            "Belgian",
            "Belizean",
            "Beninese",
            "Bhutanese",
            "Bolivian",
            "Bosnian",
            "Brazilian",
            "British",
            "Bruneian",
            "Bulgarian",
            "Burkinabe",
            "Burmese",
            "Burundian",
            "Cambodian",
            "Cameroonian",
            "Canadian",
            "Cape Verdean",
            "Central African",
            "Chadian",
            "Chilean",
            "Chinese",
            "Colombian",
            "Comoran",
            "Congolese",
            "Costa Rican",
            "Croatian",
            "Cuban",
            "Cypriot",
            "Czech",
            "Danish",
            "Djibouti",
            "Dominican",
            "Dutch",
            "East Timorese",
            "Ecuadorean",
            "Egyptian",
            "Emirian",
            "Equatorial Guinean",
            "Eritrean",
            "Estonian",
            "Ethiopian",
            "Fijian",
            "Filipino",
            "Finnish",
            "French",
            "Gabonese",
            "Gambian",
            "Georgian",
            "German",
            "Ghanaian",
            "Greek",
            "Grenadian",
            "Guatemalan",
            "Guinea-Bissauan",
            "Guinean",
            "Guyanese",
            "Haitian",
            "Herzegovinian",
            "Honduran",
            "Hungarian",
            "I-Kiribati",
            "Icelander",
            "Indian",
            "Indonesian",
            "Iranian",
            "Iraqi",
            "Irish",
            "Israeli",
            "Italian",
            "Ivorian",
            "Jamaican",
            "Japanese",
            "Jordanian",
            "Kazakhstani",
            "Kenyan",
            "Kittian and Nevisian",
            "Kuwaiti",
            "Kyrgyz",
            "Laotian",
            "Latvian",
            "Lebanese",
            "Liberian",
            "Libyan",
            "Liechtensteiner",
            "Lithuanian",
            "Luxembourger",
            "Macedonian",
            "Malagasy",
            "Malawian",
            "Malaysian",
            "Maldivan",
            "Malian",
            "Maltese",
            "Marshallese",
            "Mauritanian",
            "Mauritian",
            "Mexican",
            "Micronesian",
            "Moldovan",
            "Monacan",
            "Mongolian",
            "Moroccan",
            "Mosotho",
            "Motswana",
            "Mozambican",
            "Namibian",
            "Nauruan",
            "Nepalese",
            "New Zealander",
            "Nicaraguan",
            "Nigerian",
            "Nigerien",
            "North Korean",
            "Northern Irish",
            "Norwegian",
            "Omani",
            "Pakistani",
            "Palauan",
            "Panamanian",
            "Papua New Guinean",
            "Paraguayan",
            "Peruvian",
            "Polish",
            "Portuguese",
            "Qatari",
            "Romanian",
            "Russian",
            "Rwandan",
            "Saint Lucian",
            "Salvadoran",
            "Samoan",
            "San Marinese",
            "Sao Tomean",
            "Saudi",
            "Scottish",
            "Senegalese",
            "Serbian",
            "Seychellois",
            "Sierra Leonean",
            "Singaporean",
            "Slovakian",
            "Slovenian",
            "Solomon Islander",
            "Somali",
            "South African",
            "South Korean",
            "Spanish",
            "Sri Lankan",
            "Sudanese",
            "Surinamer",
            "Swazi",
            "Swedish",
            "Swiss",
            "Syrian",
            "Taiwanese",
            "Tajik",
            "Tanzanian",
            "Thai",
            "Togolese",
            "Tongan",
            "Trinidadian or Tobagonian",
            "Tunisian",
            "Turkish",
            "Tuvaluan",
            "Ugandan",
            "Ukrainian",
            "Uruguayan",
            "Uzbekistani",
            "Venezuelan",
            "Vietnamese",
            "Welsh",
            "Yemenite",
            "Zambian",
            "Zimbabwean"
        ]

        const nationalityOptions = nationality.map(nation => ({
            key: nation,
            text: nation,
            value: nation,

        }));

      //  console.log("Render Edit");
        return (
            <div className="ui grid">
            <div className='row'>
                <div className="ui sixteen wide column">
                    <React.Fragment>
                        <Form fixed>
                            <Form.Group>
                                <Form.Select
                                    fixed
                                    search
                                    selection
                                    options={nationalityOptions}
                                    value={this.state.newnationalityData}
                                    onChange={(e, { value }) => {
                                        this.setState({ newnationalityData: value })
                                    }}
                                />
                            </Form.Group>
                        </Form>

                    </React.Fragment>
                    <button type="button" className="ui teal button" onClick={this.saveNationality.bind(this)}>Save</button>
                </div>
            </div>
            </div>

        );

    }
}