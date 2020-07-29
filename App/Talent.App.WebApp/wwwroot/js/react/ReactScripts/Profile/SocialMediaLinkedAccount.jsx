/* Social media JSX */
import React from 'react';
import { ChildSingleInput } from '../Form/SingleInput.jsx';
import { Popup } from 'semantic-ui-react';

export default class SocialMediaLinkedAccount extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showEditSection: false,
            newLinkedAccounts: {}
        }

        this.openEdit = this.openEdit.bind(this)
        this.closeEdit = this.closeEdit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.saveLinkedAccounts = this.saveLinkedAccounts.bind(this)
        this.renderEdit = this.renderEdit = this.renderEdit.bind(this)
        this.renderDisplay = this.renderDisplay.bind(this)
    }

    openEdit() {
        const linkedAccounts = Object.assign({}, this.props.linkedAccounts)
        this.setState({
            showEditSection: true,
            newLinkedAccounts: linkedAccounts
        })
    }

    closeEdit() {
        this.setState({
            showEditSection: false
        })
    }

    handleChange(event) {
        const data = Object.assign({}, this.state.newLinkedAccounts)
        data[event.target.name] = event.target.value
        this.setState({
            newLinkedAccounts: data
        })
    }

    saveLinkedAccounts() {
       // console.log(this.state.newLinkedAccounts)
        let data = { linkedAccounts: {} }
        data.linkedAccounts = Object.assign({}, this.state.newLinkedAccounts)
        this.props.saveProfileData(data)
        this.closeEdit()
    }


    componentDidMount() {
        $('.ui.button.social-media')
            .popup();
    }



    render() {
        return (
            this.state.showEditSection ? this.renderEdit() : this.renderDisplay()
        );
    }

    renderEdit() {
        return (
            <div className='ui sixteen wide column'>
                <ChildSingleInput
                    inputType="text"
                    label="LinkedIn"
                    name="linkedIn"
                    value={this.state.newLinkedAccounts.linkedIn}
                    controlFunc={this.handleChange}
                    maxLength={80}
                    placeholder="Enter your LinkedIn Url"
                    errorMessage="Please enter a valid Url"
                />
                <ChildSingleInput
                    inputType="text"
                    label="GitHub"
                    name="github"
                    value={this.state.newLinkedAccounts.github}
                    controlFunc={this.handleChange}
                    maxLength={80}
                    placeholder="Enter your GitHub Url"
                    errorMessage="Please enter a valid url"
                />

                <button type="button" className="ui teal button" onClick={this.saveLinkedAccounts}>Save</button>
                <button type="button" className="ui button" onClick={this.closeEdit}>Cancel</button>
            </div>
        )
    }

    renderDisplay() {
        let linkedIn = this.props.linkedAccounts ? this.props.linkedAccounts.linkedIn : ""
        let github = this.props.linkedAccounts ? this.props.linkedAccounts.github : ""

        return (
            <div className='row'>
                <div className="ui sixteen wide column">
                    <React.Fragment>
                        <a href={linkedIn} className="ui linkedin button socialMedia">
                            <i className="linkedin icon"></i>
                            LinkedIn
                        </a>
                        <a href={github} className="ui floated teal button socialMedia">
                            <i className="github icon"></i>
                            GitHub
                        </a>
                    </React.Fragment>
                    <button type="button" className="ui right floated teal button" onClick={this.openEdit}>Edit</button>
                </div>
            </div >
        )
    }
}