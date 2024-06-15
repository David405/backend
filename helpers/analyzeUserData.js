const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const mammoth = require('mammoth');

async function downloadFile(url, dest) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    const fileStream = fs.createWriteStream(dest);
    return new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on('error', reject);
        fileStream.on('finish', resolve);
    });
}

async function readFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileBuffer = fs.readFileSync(filePath);
    let textContent = '';

    switch (ext) {
        case '.pdf':
            const data = await pdfParse(fileBuffer);
            textContent = data.text;
            break;
        case '.docx':
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            textContent = result.value;
            break;
        case '.txt':
            textContent = fileBuffer.toString();
            break;
        default:
            throw new Error('Unsupported file format');
    }

    return extractUserData(textContent);
}

function extractUserData(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const nameRegex = /([A-Z][a-z]+ [A-Z][a-z]+)/;
    const linkedinRegex = /linkedin\.com\/in\/([A-Za-z0-9-]+)/i;
    const githubRegex = /github\.com\/([A-Za-z0-9-]+)/i;
    const experienceRegex = /Experience[\s\S]*?(?=Education|$)/i;
    const educationRegex = /Education[\s\S]*?(?=Experience|$)/i;
    const skillsRegex = /Skills[\s\S]*?(?=Experience|Education|$)/i;

    const email = (text.match(emailRegex) || ['Not found'])[0];
    const name = (text.match(nameRegex) || ['Not found'])[0];
    const linkedin = (text.match(linkedinRegex) || ['Not found'])[0];
    const github = (text.match(githubRegex) || ['Not found'])[0];
    const experienceMatch = text.match(experienceRegex);
    const educationMatch = text.match(educationRegex);
    const skillsMatch = text.match(skillsRegex);

    const experience = extractExperience(experienceMatch ? experienceMatch[0] : '');
    const education = extractEducation(educationMatch ? educationMatch[0] : '');
    const skills = skillsMatch ? skillsMatch[0].replace(/Skills/gi, '').trim() : 'Not found';

    console.log({
        email,
        name,
        github: `https://github.com/${github}`,
        linkedin: `https://www.linkedin.com/in/${linkedin}`,
        skills,
        experience,
        education,
    })

    return {
        email,
        name,
        github: `https://github.com/${github}`,
        linkedin: `https://www.linkedin.com/in/${linkedin}`,
        skills,
        experience,
        education,
    };
}

function extractExperience(text) {
    const experienceArray = [];
    const expRegex = /(\b[A-Z]{3}\s\d{4}\s-\s[A-Z]{3}\s\d{4}|\b[A-Z]{3}\s\d{4}\s-\sCURRENT)\s([\s\S]*?)(?=\b[A-Z]{3}\s\d{4}\s-\s[A-Z]{3}\s\d{4}|\b[A-Z]{3}\s\d{4}\s-\sCURRENT|\n\n|$)/g;
    let match;
    while ((match = expRegex.exec(text)) !== null) {
        experienceArray.push({
            period: match[1].trim(),
            jobTitleAndCompany: match[2].split('●')[0].trim(),
            description: match[2].split('●').slice(1).join('●').trim(),
        });
    }
    return experienceArray;
}

function extractEducation(text) {
    const educationArray = [];
    const eduRegex = /(\b[A-Z]{3}\s\d{4}\s-\s[A-Z]{3}\s\d{4})\s([\s\S]*?)(?=\b[A-Z]{3}\s\d{4}\s-\s[A-Z]{3}\s\d{4}|\n\n|$)/g;
    let match;
    while ((match = eduRegex.exec(text)) !== null) {
        educationArray.push({
            period: match[1].trim(),
            degree: match[2].split('●')[0].trim(),
            description: match[2].split('●').slice(1).join('●').trim(),
        });
    }
    return educationArray;
}

async function readFileFromUrl(url) {
    const tempFilePath = `uploads/${uuidv4()}${path.extname(url)}`;
    try {
        await downloadFile(url, tempFilePath);
        const userData = await readFile(tempFilePath);
        fs.unlinkSync(tempFilePath); // Delete the temporary file after processing
        return userData;
    } catch (error) {
        console.error('Error processing file from URL:', error.message);
        return null;
    }
}

module.exports = {
    readFileFromUrl
}