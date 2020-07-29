import React from 'react';
import Cookies from 'js-cookie';
import { ChildSingleInput } from '../Form/SingleInput.jsx';
import { Table, Form, Input, Select, Button, Icon, Dropdown, Option } from 'semantic-ui-react';

export default class Experience extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showEditSection: false,
            currentlyEditing: false,
            langname: "",
            langlevel: "",
            skills: [],
            skill: [],
            val: "",
            data: {
                name: "",
                level: ""
            },
            updateData: {
                id: " ",
                name: "",
                level: ""
            },
            name: "",
            level: ""
        }

        this.openEdit = this.openEdit.bind(this)
        this.closeEdit = this.closeEdit.bind(this)
        this.check = this.check.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.loadData = this.loadData.bind(this)
        this.addSkill = this.addSkill.bind(this);
        this.addSkills = this.addSkills.bind(this)
        this.deleteSkill = this.deleteSkill.bind(this);
        this.deleteSkills = this.deleteSkills.bind(this);
        this.updateSkill = this.updateSkill.bind(this);
        this.updateSkills = this.updateSkills.bind(this);
        this.updateWithoutSave = this.updateWithoutSave.bind(this)
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        this.setState({
            showEditSection:false})
            
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'http://localhost:60290/profile/profile/getSkill',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            success: function (res) {
               // console.log(res.data)
                this.updateWithoutSave(res.data)
            }.bind(this)
        })
    }

    updateWithoutSave(newValues) {
      
        let newSkill = Object.assign([], this.state.skills, newValues)
        this.setState({
            skills: newSkill
        })
       // console.log("Skill State",this.state.skills)
    }

    openEdit() {
      
        this.setState({
            showEditSection: true,
            updateData: { id: null }
        })
    }

    closeEdit() {
        this.setState({
            showEditSection: false
        })
       // console.log("Close Edit:" + this.state.currentlyEditing);
    }

    addSkill() {

        this.setState({
            skill: this.state.data
        }, this.addSkills);

    }

    deleteSkill(lang) {
       // console.log(lang)
        this.setState({
            skill: lang,
            skills: []
        }, this.deleteSkills)
    }


    addSkills() {
       // console.log("Add skills called");
       // console.log(JSON.stringify(this.state.skill))
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'http://localhost:60290/profile/profile/addSkill',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(this.state.skill),
            success: function (res) {
                console.log(res, res.success + "successmess")
                if (res.success == true) {
                    TalentUtil.notification.show("skill Added sucessfully", "success", null, null)
                    this.loadData()
                } else {
                    TalentUtil.notification.show("skills did not Added successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res.success + "errormess")
               // console.log(res)
                //console.log(a)
                //console.log(b)
            }
        })

    }

    deleteSkills() {

       // console.log(JSON.stringify(this.state.skill))
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'http://localhost:60290/profile/profile/deleteSkill',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(this.state.skill),
            success: function (res) {
               //console.log(res, res.success + "successmess")
                if (res.success == true) {
                    TalentUtil.notification.show("Skill Deleted sucessfully", "success", null, null)
                   // console.log("going to load data")
                    this.loadData()
                } else {
                    TalentUtil.notification.show("Skill did not deleted successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res.success + "errormess")
               // console.log(res)
               // console.log(a)
               // console.log(b)
            }
        })
    }

    updateSkill() {
       // console.log(this.state.skill)
        this.setState({
            skill: this.state.updateData
        }, this.updateSkills)
    }

    updateSkills() {

        //console.log(JSON.stringify(this.state.skill))
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'http://localhost:60290/profile/profile/UpdateSkill',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(this.state.skill),
            success: function (res) {
                console.log(res, res.success + "successmess")
                if (res.success == true) {
                    TalentUtil.notification.show("Skill updated sucessfully", "success", null, null)
                    console.log("going to load data")
                    this.loadData()
                } else {
                    TalentUtil.notification.show("Skill did not update successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res.success + "errormess")
               // console.log(res)
                //console.log(a)
                //console.log(b)
            }
        })
        this.cancel()
    }

    check(lang) {
       // console.log(lang)
        this.setState({
            currentlyEditing: true,
            updateData: {
                id: lang.id,
                name: lang.name,
                level: lang.level
            }
        })

    }

    cancel() {
        this.setState({
            currentlyEditing: false,
        })
       // console.log("Cancel clicked after:" + this.state.currentlyEditing);
    }

    handleChange() {

        if (this.state.updateData.id != null) {
            const updateData = Object.assign({}, this.state.updateData);
            updateData[event.target.name] = event.target.value;
            this.setState({ updateData }, () => console.log(this.state.updateData))
        }
        else {
            const data = Object.assign({}, this.state.data);
            data[event.target.name] = event.target.value;
            this.setState({ data }, () => console.log(this.state.data))
        }


    }

    render() {
        return (
            this.state.showEditSection ? this.renderEdit() : this.renderDisplay()
        )
    }

    renderEdit() {
      

        return (

            <div className='ui sixteen wide column'>
                <React.Fragment>

                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Field control={Input}
                                placeholder='Add Skill'
                                name="name"
                                onChange={this.handleChange}
                            />

                            <Form.Field>
                                <select className="ui right labeled dropdown"
                                    placeholder="Skill Level"
                                    onChange={this.handleChange}
                                    name="level"
                                >
                                    <option value="">Select Level</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </Form.Field>
                            <Form.Field>
                                <button type="button" className="ui teal button" onClick={this.addSkill}>Add</button>
                                <button type="button" className="ui button" onClick={this.closeEdit}>Cancel</button>
                            </Form.Field>
                        </Form.Group>

                    </Form>
                    <br />
                </React.Fragment>

                <React.Fragment>
                    {this.renderDisplay()}
                </React.Fragment>
            </div>
        )
    }

    renderDisplay() {
       // console.log("Called Display");
        //console.log(this.state.updateData);

        const { skills } = this.state;

        return (
            <div className='row'>
                <div className="ui sixteen wide column">
                    <React.Fragment>
                        <Table fixed>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Skill</Table.HeaderCell>
                                    <Table.HeaderCell>Level</Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <button type="button" className="ui floated teal button" onClick={this.openEdit}>+ Add New</button>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {skills.map((name) => (
                                    <Table.Row key={name.id}>
                                        <Table.Cell>
                                            {this.state.currentlyEditing && this.state.updateData.id === name.id ? (

                                                <Table.Cell>
                                                   
                                                    <Form>
                                                        <Form.Field control={Input}
                                                            placeholder='Add Skill'
                                                            name="name"
                                                            value={this.state.updateData.name}
                                                            onChange={this.handleChange}
                                                        />
                                                    </Form>
                                                   
                                                </Table.Cell>
                                            )
                                                :
                                                (
                                                    <div><Table.Cell>{name.name}</Table.Cell></div>
                                                )
                                            }
                                        </Table.Cell>
                                        <Table.Cell>
                                            {this.state.currentlyEditing && this.state.updateData.id === name.id ? (
                                                
                                                    
                                                        <Form>
                                                            <select className="ui right labeled dropdown"
                                                                placeholder="Language Level"
                                                                onChange={this.handleChange}
                                                                name="level"
                                                                value={this.state.updateData.level}
                                                            >
                                                                <option value="">Select Level</option>
                                                                <option value="Beginner">Beginner</option>
                                                                <option value="Intermediate">Intermediate</option>
                                                                <option value="Expert">Expert</option>
                                                            </select>
                                                        </Form>
                               
                                                

                                            )
                                                : (
                                                    <div>{name.level}</div>
                                                )
                                            }
                                        </Table.Cell>
                                        <Table.Cell textAlign='right'>
                                            {this.state.currentlyEditing && this.state.updateData.id === name.id ? (
                                                <div>
                                                    <button type="button" className="ui teal button"  onClick={this.updateSkill.bind(this)}>Update</button>
                                                    <button type="button" className="ui button" onClick={this.cancel.bind(this)}>Cancel</button>
                                                </div>
                                            )
                                                : (
                                                    <div>
                                                        
                                                            <Icon link name='pencil' onClick={this.check.bind(this, name)} />
                                                            <Icon link name='delete' onClick={this.deleteSkill.bind(this, name)} />
                                                        
                                                   
                                                     </div>
                                                )}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>

                        </Table>
                    </React.Fragment>
                </div>
            </div>
        )
    }
}