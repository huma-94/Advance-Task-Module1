using Talent.Common.Contracts;
using Talent.Common.Models;
using Talent.Common.Security;
using Talent.Services.Profile.Models.Profile;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using RawRabbit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using MongoDB.Driver;
using Talent.Services.Profile.Domain.Contracts;
using Talent.Common.Aws;
using Talent.Services.Profile.Models;

namespace Talent.Services.Profile.Controllers
{
    [Route("profile/[controller]")]
    public class ProfileController : Controller
    {
        private readonly IBusClient _busClient;
        private readonly IAuthenticationService _authenticationService;
        private readonly IProfileService _profileService;
        private readonly IFileService _documentService;
        private readonly IUserAppContext _userAppContext;
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<UserLanguage> _userLanguageRepository;
        private readonly IRepository<UserDescription> _personDescriptionRespository;
        private readonly IRepository<UserAvailability> _userAvailabilityRepository;
        private readonly IRepository<UserSkill> _userSkillRepository;
        private readonly IRepository<UserEducation> _userEducationRepository;
        private readonly IRepository<UserCertification> _userCertificationRepository;
        private readonly IRepository<UserLocation> _userLocationRepository;
        private readonly IRepository<Employer> _employerRepository;
        private readonly IRepository<UserDocument> _userDocumentRepository;
        private readonly IHostingEnvironment _environment;
        private readonly IRepository<Recruiter> _recruiterRepository;
        private readonly IAwsService _awsService;
        private readonly string _profileImageFolder;

        public ProfileController(IBusClient busClient,
            IProfileService profileService,
            IFileService documentService,
            IRepository<User> userRepository,
            IRepository<UserLanguage> userLanguageRepository,
            IRepository<UserDescription> personDescriptionRepository,
            IRepository<UserAvailability> userAvailabilityRepository,
            IRepository<UserSkill> userSkillRepository,
            IRepository<UserEducation> userEducationRepository,
            IRepository<UserCertification> userCertificationRepository,
            IRepository<UserLocation> userLocationRepository,
            IRepository<Employer> employerRepository,
            IRepository<UserDocument> userDocumentRepository,
            IRepository<Recruiter> recruiterRepository,
            IHostingEnvironment environment,
            IAwsService awsService,
            IUserAppContext userAppContext)
        {
            _busClient = busClient;
            _profileService = profileService;
            _documentService = documentService;
            _userAppContext = userAppContext;
            _userRepository = userRepository;
            _personDescriptionRespository = personDescriptionRepository;
            _userLanguageRepository = userLanguageRepository;
            _userAvailabilityRepository = userAvailabilityRepository;
            _userSkillRepository = userSkillRepository;
            _userEducationRepository = userEducationRepository;
            _userCertificationRepository = userCertificationRepository;
            _userLocationRepository = userLocationRepository;
            _employerRepository = employerRepository;
            _userDocumentRepository = userDocumentRepository;
            _recruiterRepository = recruiterRepository;
            _environment = environment;
            _profileImageFolder = "images\\";
            _awsService = awsService;
        }

        #region Talent

        [HttpGet("getProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = _userAppContext.CurrentUserId;
            var user = await _userRepository.GetByIdAsync(userId);
            return Json(new { Username = user.FirstName });
        }

        [HttpGet("getProfileById")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetProfileById(string uid)
        {
            var userId = uid;
            var user = await _userRepository.GetByIdAsync(userId);
            return Json(new { userName = user.FirstName, createdOn = user.CreatedOn });
        }

        [HttpGet("isUserAuthenticated")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> IsUserAuthenticated()
        {
            if (_userAppContext.CurrentUserId == null)
            {
                return Json(new { IsAuthenticated = false });
            }
            else
            {
                var person = await _userRepository.GetByIdAsync(_userAppContext.CurrentUserId);
                if (person != null)
                {
                    return Json(new { IsAuthenticated = true, Username = person.FirstName, Type = "talent" });
                }
                var employer = await _employerRepository.GetByIdAsync(_userAppContext.CurrentUserId);
                if (employer != null)
                {
                    return Json(new { IsAuthenticated = true, Username = employer.CompanyContact.Name, Type = "employer" });
                }
                var recruiter = await _recruiterRepository.GetByIdAsync(_userAppContext.CurrentUserId);
                if (recruiter != null)
                {
                    return Json(new { IsAuthenticated = true, Username = recruiter.CompanyContact.Name, Type = "recruiter" });
                }
                return Json(new { IsAuthenticated = false, Type = "" });
            }
        }

        [HttpGet("getLanguage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetLanguages(String id = "")
        {
            String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
            User profile = null;
            profile = (await _userRepository.GetByIdAsync(talentId));
            {
                var languages = profile.Languages.Select(x => new AddLanguageViewModel { Id = x.Id, Name = x.Language, Level = x.LanguageLevel }).ToList();

                return Json(new { Success = true, data = languages });
            }
            
        }

        [HttpPost("addLanguage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public ActionResult AddLanguage([FromBody] AddLanguageViewModel language)
        {
            {
                if (ModelState.IsValid)
                {
                    String id = " ";
                    String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
                    var addLanguage = new UserLanguage
                    {
                        Id = ObjectId.GenerateNewId().ToString(),
                        UserId = _userAppContext.CurrentUserId,
                        Language = language.Name,
                        LanguageLevel = language.Level,
                        IsDeleted = false
                    };
                    var user = _userRepository.GetByIdAsync(talentId).Result;
                    user.Languages.Add(addLanguage);
                    _userRepository.Update(user);
                    return Json(new { Success = true });
                }
                return Json(new { Success = false });
            }
        }

        [HttpPost("updateLanguage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<ActionResult> UpdateLanguage([FromBody] AddLanguageViewModel language)
        {
            if (ModelState.IsValid)
            {
                String id = " ";
                String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
                var user = _userRepository.GetByIdAsync(talentId).Result;
                if (language.Id != null)
                {
                    var updateLanguage = user.Languages.SingleOrDefault(x => x.Id == language.Id);

                    {
                        updateLanguage.Language = language.Name;
                        updateLanguage.LanguageLevel = language.Level;

                    }
                    await _userRepository.Update(user);

                }
                return Json(new { Success = true });
            }
            return Json(new { Success = false });
        }

        [HttpPost("deleteLanguage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<ActionResult> DeleteLanguage([FromBody] AddLanguageViewModel language)
        {
            String id = " ";
            String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
            User profile = null;
            profile = (await _userRepository.GetByIdAsync(talentId));

            var langelement = profile.Languages.SingleOrDefault(x => x.Id == language.Id);
            {
                profile.Languages.Remove(langelement);
                await _userRepository.Update(profile);
                return Json(new { Success = true });
            }
        }

        [HttpGet("getSkill")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetSkills()
        {
            String id = "";
            String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
            User profile = null;
            profile = (await _userRepository.GetByIdAsync(talentId));
            {
                var skills = profile.Skills.Select(x => new AddSkillViewModel { Id = x.Id, Name = x.Skill, Level = x.ExperienceLevel }).ToList();

                return Json(new { Success = true, data = skills });
            }
        }

        [HttpPost("addSkill")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public ActionResult AddSkill([FromBody]AddSkillViewModel skill)
        {
            if (ModelState.IsValid)
            {
                String id = " ";
                String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
                var addSkill = new UserSkill
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    UserId = _userAppContext.CurrentUserId,
                    Skill = skill.Name,
                    ExperienceLevel = skill.Level,
                    IsDeleted = false
                };
                var user = _userRepository.GetByIdAsync(talentId).Result;
                user.Skills.Add(addSkill);
                _userRepository.Update(user);
                return Json(new { Success = true });
            }
            return Json(new { Success = false });
        }

        [HttpPost("updateSkill")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateSkill([FromBody]AddSkillViewModel skill)
        {
            if (ModelState.IsValid)
            {
                String id = " ";
                String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
                var user = _userRepository.GetByIdAsync(talentId).Result;
                if (skill.Id != null)
                {
                    var updateSkill = user.Skills.SingleOrDefault(x => x.Id == skill.Id);

                    {
                        updateSkill.Skill = skill.Name;
                        updateSkill.ExperienceLevel = skill.Level;

                    }
                    await _userRepository.Update(user);

                }
                return Json(new { Success = true });
            }
            return Json(new { Success = false });
        }

        [HttpPost("deleteSkill")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> DeleteSkill([FromBody]AddSkillViewModel skill)
        {
            String id = " ";
            String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
            User profile = null;
            profile = (await _userRepository.GetByIdAsync(talentId));

            var skillelement = profile.Skills.SingleOrDefault(x => x.Id == skill.Id);
            {
                profile.Skills.Remove(skillelement);
                await _userRepository.Update(profile);
                return Json(new { Success = true });
            }
        }

        [HttpGet("getExperience")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetExperiences()
        {
            String id = "";
            String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
            User profile = null;
            profile = (await _userRepository.GetByIdAsync(talentId));
            {
                var experiences = profile.Experience.Select(x => new ExperienceViewModel
                {   Id = x.Id,
                    Company = x.Company,
                    Position = x.Position,
                    Responsibilities = x.Responsibilities,
                    Start = x.Start,
                    End = x.End
                }).ToList();

                return Json(new { Success = true, data = experiences });
            }
        }

        [HttpPost("addExperience")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public ActionResult AddExperience([FromBody]ExperienceViewModel experience)
        {
            if (ModelState.IsValid)
            {
                String id = " ";
                String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
                var addExperience = new UserExperience
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    Company = experience.Company,
                    Position = experience.Position,
                    Responsibilities = experience.Responsibilities,
                    Start = experience.Start,
                    End = experience.End,
                };
                var user = _userRepository.GetByIdAsync(talentId).Result;
                user.Experience.Add(addExperience);
                _userRepository.Update(user);
                return Json(new { Success = true });
            }
            return Json(new { Success = false });
        }

        [HttpPost("updateExperience")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateExperience([FromBody]ExperienceViewModel experience)
        {
            if (ModelState.IsValid)
            {
                String id = " ";
                String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
                var user = _userRepository.GetByIdAsync(talentId).Result;
                if (experience.Id != null)
                {
                    var updateExperience = user.Experience.SingleOrDefault(x => x.Id == experience.Id);

                    {
                        updateExperience.Company = experience.Company;
                        updateExperience.Position = experience.Position;
                        updateExperience.Responsibilities = experience.Responsibilities;
                        updateExperience.Start = experience.Start;
                        updateExperience.End = experience.End;

                    }
                    await _userRepository.Update(user);

                }
                return Json(new { Success = true });
            }
            return Json(new { Success = false });
        }

        [HttpPost("deleteExperience")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> DeleteExperience([FromBody]ExperienceViewModel experience)
        {
            String id = " ";
            String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
            User profile = null;
            profile = (await _userRepository.GetByIdAsync(talentId));

            var experienceelement = profile.Experience.SingleOrDefault(x => x.Id == experience.Id);
            {
                profile.Experience.Remove(experienceelement);
                await _userRepository.Update(profile);
                return Json(new { Success = true });
            }
        }

        [HttpGet("getCertification")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> getCertification()
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("addCertification")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public ActionResult addCertification([FromBody] AddCertificationViewModel certificate)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("updateCertification")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateCertification([FromBody] AddCertificationViewModel certificate)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("deleteCertification")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> DeleteCertification([FromBody] AddCertificationViewModel certificate)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        // TI

        [HttpGet("getProfileImage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public ActionResult getProfileImage(string Id)
        {
            var profileUrl = _documentService.GetFileURL(Id, FileType.ProfilePhoto);
            //Please do logic for no image available - maybe placeholder would be fine
            return Json(new { profilePath = profileUrl });
        }

        [HttpPost("updateProfilePhoto")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<ActionResult> UpdateProfilePhoto()
        {
            //Your code here;
            IFormFile file = Request.Form.Files[0];

            if (await _profileService.UpdateTalentPhoto(_userAppContext.CurrentUserId, file))
            {
                return Json(new { Success = true });
            }

            return Json(new { Success = false });

        }

        [HttpPost("updateTalentCV")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<ActionResult> UpdateTalentCV()
        {
            IFormFile file = Request.Form.Files[0];
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("updateTalentVideo")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateTalentVideo()
        {
            IFormFile file = Request.Form.Files[0];
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpGet("getInfo")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetInfo()
        {
            //Your code here;
            throw new NotImplementedException();
        }


        [HttpPost("addInfo")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> AddInfo([FromBody] DescriptionViewModel pValue)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpGet("getEducation")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> GetEducation()
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("addEducation")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public IActionResult AddEducation([FromBody]AddEducationViewModel model)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("updateEducation")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateEducation([FromBody]AddEducationViewModel model)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("deleteEducation")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> DeleteEducation([FromBody] AddEducationViewModel model)
        {
            //Your code here;
            throw new NotImplementedException();
        }

     
        #endregion

        #region EmployerOrRecruiter

        [HttpGet("getEmployerProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<IActionResult> GetEmployerProfile(String id = "", String role = "")
                    {
            try
            {
                string userId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
                string userRole = String.IsNullOrWhiteSpace(role) ? _userAppContext.CurrentRole : role;

                var employerResult = await _profileService.GetEmployerProfile(userId, userRole);

                return Json(new { Success = true, employer = employerResult });
            }
            catch (Exception e)
            {
                return Json(new { Success = false, message = e });
            }
        }

        [HttpPost("saveEmployerProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<IActionResult> SaveEmployerProfile([FromBody] EmployerProfileViewModel employer)
        {
            if (ModelState.IsValid)
            {
                if (await _profileService.UpdateEmployerProfile(employer, _userAppContext.CurrentUserId, _userAppContext.CurrentRole))
                {
                    return Json(new { Success = true });
                }
            }
            return Json(new { Success = false });
        }

        [HttpPost("saveClientProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public async Task<IActionResult> SaveClientProfile([FromBody] EmployerProfileViewModel employer)
        {
            if (ModelState.IsValid)
            {
                
                var recruiterClients =(await _recruiterRepository.GetByIdAsync(_userAppContext.CurrentUserId)).Clients;

                if (recruiterClients.Select(x => x.EmployerId == employer.Id).FirstOrDefault())
                {
                    if (await _profileService.UpdateEmployerProfile(employer, _userAppContext.CurrentUserId, "employer"))
                    {
                        return Json(new { Success = true });
                    }
                }
            }
            return Json(new { Success = false });
        }

        [HttpPost("updateEmployerPhoto")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<ActionResult> UpdateEmployerPhoto()
        {
            IFormFile file = Request.Form.Files[0];
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpPost("updateEmployerVideo")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<IActionResult> UpdateEmployerVideo()
        {
            IFormFile file = Request.Form.Files[0];
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpGet("getEmployerProfileImage")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "employer, recruiter")]
        public async Task<ActionResult> GetWorkSample(string Id)
        {
            //Your code here;
            throw new NotImplementedException();
        }

        [HttpGet("getEmployerProfileImages")]
        public ActionResult GetWorkSampleImage(string Id)
        {
            //Your code here;
            throw new NotImplementedException();
        }
        
        #endregion

        #region TalentFeed

        [HttpGet("getTalentProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent, employer, recruiter")]
        public async Task<IActionResult> GetTalentProfile(String id = "")
        {
            String talentId = String.IsNullOrWhiteSpace(id) ? _userAppContext.CurrentUserId : id;
            var userProfile = await _profileService.GetTalentProfile(talentId);
          
            return Json(new { Success = true, data = userProfile });
        }

        [HttpPost("updateTalentProfile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "talent")]
        public async Task<IActionResult> UpdateTalentProfile([FromBody]TalentProfileViewModel profile)
        {
            if (ModelState.IsValid)
            {
                if (await _profileService.UpdateTalentProfile(profile, _userAppContext.CurrentUserId))
                {
                    return Json(new { Success = true });
                }
            }
            return Json(new { Success = false });
        }

        [HttpGet("getTalent")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter, employer")]
        public async Task<IActionResult> GetTalentSnapshots(FeedIncrementModel feed)
        {
            try
            {
                var result = (await _profileService.GetTalentSnapshotList(_userAppContext.CurrentUserId, false, feed.Position, feed.Number)).ToList();

                return Json(new { Success = true, Data = result });
            }
            catch (Exception e)
            {
                return Json(new { Success = false, e.Message });
            }
        }
        #endregion

        #region TalentMatching

        [HttpGet("getTalentList")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public async Task<IActionResult> GetTalentListAsync()
        {
            try
            {
                var result = await _profileService.GetFullTalentList();
                return Json(new { Success = true, Data = result });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpGet("getEmployerList")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public IActionResult GetEmployerList()
        {
            try
            {
                var result = _profileService.GetEmployerList();
                return Json(new { Success = true, Data = result });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpPost("getEmployerListFilter")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public IActionResult GetEmployerListFilter([FromBody]SearchCompanyModel model)
        {
            try
            {
                var result = _profileService.GetEmployerListByFilterAsync(model);//change to filters
                if (result.IsCompletedSuccessfully)
                    return Json(new { Success = true, Data = result.Result });
                else
                    return Json(new { Success = false, Message = "No Results found" });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpPost("getTalentListFilter")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public IActionResult GetTalentListFilter([FromBody] SearchTalentModel model)
        {
            try
            {
                var result = _profileService.GetTalentListByFilterAsync(model);//change to filters
                return Json(new { Success = true, Data = result.Result });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpGet("getSuggestionList")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public IActionResult GetSuggestionList(string employerOrJobId, bool forJob)
        {
            try
            {
                var result = _profileService.GetSuggestionList(employerOrJobId, forJob, _userAppContext.CurrentUserId);
                return Json(new { Success = true, Data = result });
            }
            catch (MongoException e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        [HttpPost("addTalentSuggestions")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public async Task<IActionResult> AddTalentSuggestions([FromBody] AddTalentSuggestionList talentSuggestions)
        {
            try
            {
                if (await _profileService.AddTalentSuggestions(talentSuggestions))
                {
                    return Json(new { Success = true });
                }

            }
            catch (Exception e)
            {
                return Json(new { Success = false, e.Message });
            }
            return Json(new { Success = false });
        }

        #endregion


        #region ManageClients

        [HttpGet("getClientList")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "recruiter")]
        public async Task<IActionResult> GetClientList()
        {
            try
            {
                var result=await _profileService.GetClientListAsync(_userAppContext.CurrentUserId);

                return Json(new { Success = true, result });
            }
            catch(Exception e)
            {
                return Json(new { Success = false, e.Message });
            }
        }

        #endregion

        public IActionResult Get() => Content("Test");

    }
}
