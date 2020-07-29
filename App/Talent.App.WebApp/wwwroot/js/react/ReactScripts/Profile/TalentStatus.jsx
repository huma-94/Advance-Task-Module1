import React from 'react'
import { Form, Checkbox } from 'semantic-ui-react';
import { SingleInput } from '../Form/SingleInput.jsx';

export default class TalentStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jobSeekingStatus: {
                status: "",
                availableDate: null
            }
        };
        this.handleChange = this.handleChange.bind(this);   
    }

    handleChange() {
        debugger;
        let status = event.target.value;
        let jobSeekingStatus = Object.assign({}, this.state.jobSeekingStatus);

        jobSeekingStatus.status = status;

        this.setState({
            jobSeekingStatus: jobSeekingStatus
        })
            
        this.props.saveProfileData({
            jobSeekingStatus
        })

    }

    componentDidMount() {
        $('.ui.button.address')
            .popup();
    }

   

    render() {
        let checked =""
        if (this.props.status) {
            checked = this.props.status.status;
        }

        return (
            <div className="ui form">
                <div className="grouped fields">
                    <label>Current Status</label>
                    <div className="field">
                        <div className="ui radio checkbox">
                            <input type="radio" name="current Status"
                                onChange={this.handleChange}
                                value="Actively looking for a job"
                                checked={checked === "Actively looking for a job"} 
                            />
                            <label>Actively looking for a job</label>
                        </div>
                    </div>
                    <div className="field">
                        <div className="ui radio checkbox">
                            <input type="radio" name="current Status"
                                onChange={this.handleChange}
                                value="Not looking for a job at the moment"
                                checked={checked ==="Not looking for a job at the moment"}
                            />
                            <label>Not looking for a job at the moment</label>
                        </div>
                    </div>
                    <div className="field">
                        <div className="ui radio checkbox">
                            <input type="radio" name="current Status"
                                onChange={this.handleChange}
                                value="Currently employed but open for the offers"
                                checked={checked ==="Currently employed but open for the offers"}
                            />
                            <label>Currently employed but open for the offers</label>
                        </div>
                    </div>
                    <div className="field">
                        <div className="ui radio checkbox">
                            <input type="radio" name="current Status"
                                onChange={this.handleChange}
                                value="Will be available on later date"
                                checked={checked === "Will be available on later date"}
                            />
                            <label>Will be available on later date</label>
                        </div>
                    </div>
                </div>
            </div>    
        )
    }
} 