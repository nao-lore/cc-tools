export interface LicenseTemplate {
  id: string;
  name: string;
  spdx: string;
  permissions: string[];
  conditions: string[];
  limitations: string[];
  text: string;
}

export const LICENSE_TEMPLATES: LicenseTemplate[] = [
  {
    id: "mit",
    name: "MIT",
    spdx: "MIT",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    text: `MIT License

Copyright (c) [year] [author]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    id: "apache-2.0",
    name: "Apache 2.0",
    spdx: "Apache-2.0",
    permissions: ["Commercial use", "Distribution", "Modification", "Patent use", "Private use"],
    conditions: ["License and copyright notice", "State changes"],
    limitations: ["Liability", "Trademark use", "Warranty"],
    text: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction, and
distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by the copyright
owner that is granting the License.

"Legal Entity" shall mean the union of the acting entity and all other entities
that control, are controlled by, or are under common control with that entity.

"You" (or "Your") shall mean an individual or Legal Entity exercising permissions
granted by this License.

"Source" form shall mean the preferred form for making modifications, including
but not limited to software source code, documentation source, and configuration
files.

"Object" form shall mean any form resulting from mechanical transformation or
translation of a Source form, including but not limited to compiled object code,
generated documentation, and conversions to other media types.

"Work" shall mean the work of authorship made available under the License, as
indicated by a copyright notice that is included in or attached to the work.

"Derivative Works" shall mean any work that is based on the Work, for which the
editorial revisions, annotations, elaborations, or other modifications represent,
as a whole, an original work of authorship.

"Contribution" shall mean any work of authorship submitted to the Licensor for
inclusion in the Work by the copyright owner or by an individual or Legal Entity
authorized to submit on behalf of the copyright owner.

"Contributor" shall mean Licensor and any Legal Entity on behalf of whom a
Contribution has been received by the Licensor and included in the Work.

2. Grant of Copyright License. Subject to the terms and conditions of this
License, each Contributor hereby grants to You a perpetual, worldwide,
non-exclusive, no-charge, royalty-free, irrevocable copyright license to
reproduce, prepare Derivative Works of, publicly display, publicly perform,
sublicense, and distribute the Work and such Derivative Works in Source or
Object form.

3. Grant of Patent License. Subject to the terms and conditions of this License,
each Contributor hereby grants to You a perpetual, worldwide, non-exclusive,
no-charge, royalty-free, irrevocable patent license to make, have made, use,
offer to sell, sell, import, and otherwise transfer the Work.

4. Redistribution. You may reproduce and distribute copies of the Work or
Derivative Works thereof in any medium, with or without modifications, and in
Source or Object form, provided that You meet the following conditions:

   (a) You must give any other recipients of the Work or Derivative Works a copy
   of this License; and

   (b) You must cause any modified files to carry prominent notices stating that
   You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works that You
   distribute, all copyright, patent, trademark, and attribution notices from
   the Source form of the Work; and

   (d) If the Work includes a "NOTICE" text file, you must include a readable
   copy of the attribution notices contained within such NOTICE file.

5. Submission of Contributions. Unless You explicitly state otherwise, any
Contribution intentionally submitted for inclusion in the Work shall be under
the terms and conditions of this License.

6. Trademarks. This License does not grant permission to use the trade names,
trademarks, service marks, or product names of the Licensor.

7. Disclaimer of Warranty. Unless required by applicable law or agreed to in
writing, Licensor provides the Work on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied.

8. Limitation of Liability. In no event and under no legal theory shall any
Contributor be liable to You for damages, including any direct, indirect,
special, incidental, or exemplary damages of any character arising as a result
of this License or out of the use or inability to use the Work.

9. Accepting Warranty or Additional Liability. While redistributing the Work or
Derivative Works thereof, You may choose to offer, and charge a fee for,
acceptance of support, warranty, indemnity, or other liability obligations and
rights consistent with this License.

END OF TERMS AND CONDITIONS

Copyright [year] [author]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,
  },
  {
    id: "gpl-3.0",
    name: "GPL v3",
    spdx: "GPL-3.0-only",
    permissions: ["Commercial use", "Distribution", "Modification", "Patent use", "Private use"],
    conditions: ["Disclose source", "License and copyright notice", "Same license", "State changes"],
    limitations: ["Liability", "Warranty"],
    text: `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) [year] [author]

Everyone is permitted to copy and distribute verbatim copies of this license
document, but changing it is not allowed.

PREAMBLE

The GNU General Public License is a free, copyleft license for software and
other kinds of works.

When we speak of free software, we are referring to freedom, not price. Our
General Public Licenses are designed to make sure that you have the freedom to
distribute copies of free software (and charge for them if you wish), that you
receive source code or can get it if you want it, that you can change the
software or use pieces of it in new free programs, and that you know you can do
these things.

To protect your rights, we need to prevent others from denying you these rights
or asking you to surrender the rights. Therefore, you have certain
responsibilities if you distribute copies of the software, or if you modify it:
responsibilities to respect the freedom of others.

For example, if you distribute copies of such a program, whether gratis or for
a fee, you must pass on to the recipients the same freedoms that you received.
You must make sure that they, too, receive or can get the source code. And you
must show them these terms so they know their rights.

TERMS AND CONDITIONS

0. Definitions.

"This License" refers to version 3 of the GNU General Public License.

"The Program" refers to any copyrightable work licensed under this License.

"You" refers to the licensee.

1. Source Code.

The "source code" for a work means the preferred form of the work for making
modifications to it. "Object code" means any non-source form of a work.

2. Basic Permissions.

All rights granted under this License are granted for the term of copyright on
the Program, and are irrevocable provided the stated conditions are met. This
License explicitly affirms your unlimited permission to run the unmodified
Program.

3. Protecting Users' Legal Rights From Anti-Circumvention Law.

No covered work shall be deemed part of an effective technological measure
under any applicable law fulfilling obligations under article 11 of the WIPO
copyright treaty.

4. Conveying Verbatim Copies.

You may convey verbatim copies of the Program's source code as you receive it,
in any medium, provided that you conspicuously and appropriately publish on
each copy an appropriate copyright notice and disclaimer of warranty.

5. Conveying Modified Source Versions.

You may convey a work based on the Program, or the modifications to produce it
from the Program, in the form of source code under the terms of section 4,
provided that you also meet all of these conditions:

   a) The work must carry prominent notices stating that you modified it, and
   giving a relevant date.

   b) The work must carry prominent notices stating that it is released under
   this License.

   c) You must license the entire work, as a whole, under this License to
   anyone who comes into possession of a copy.

6. Conveying Non-Source Forms.

You may convey a work in object code form under the terms of sections 4 and 5,
provided that you also convey the machine-readable Corresponding Source.

NO WARRANTY

7. THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE
LAW. EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER
PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER
EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

8. IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING WILL
ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS THE PROGRAM
AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY GENERAL, SPECIAL,
INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE
THE PROGRAM.`,
  },
  {
    id: "bsd-2-clause",
    name: "BSD 2-Clause",
    spdx: "BSD-2-Clause",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    text: `BSD 2-Clause License

Copyright (c) [year], [author]
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  {
    id: "bsd-3-clause",
    name: "BSD 3-Clause",
    spdx: "BSD-3-Clause",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    text: `BSD 3-Clause License

Copyright (c) [year], [author]
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  {
    id: "isc",
    name: "ISC",
    spdx: "ISC",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: ["License and copyright notice"],
    limitations: ["Liability", "Warranty"],
    text: `ISC License

Copyright (c) [year], [author]

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`,
  },
  {
    id: "mpl-2.0",
    name: "MPL 2.0",
    spdx: "MPL-2.0",
    permissions: ["Commercial use", "Distribution", "Modification", "Patent use", "Private use"],
    conditions: ["Disclose source", "License and copyright notice", "Same license (file)"],
    limitations: ["Liability", "Trademark use", "Warranty"],
    text: `Mozilla Public License Version 2.0

1. Definitions

1.1. "Contributor" means each individual or legal entity that creates, contributes
to the creation of, or owns Covered Software.

1.2. "Contributor Version" means the combination of the Contributions of others
(if any) used by a Contributor and that particular Contributor's Contribution.

1.3. "Contribution" means Covered Software of a particular Contributor.

1.4. "Covered Software" means Source Code Form to which the initial Contributor
has attached the notice in Exhibit A, the Executable Form of such Source Code
Form, and Modifications of such Source Code Form, in each case including
portions thereof.

1.5. "Incompatible With Secondary Licenses" means that the initial Contributor
has attached the notice described in Exhibit B to the Covered Software.

1.6. "Executable Form" means any form of the work other than Source Code Form.

1.7. "Larger Work" means a work that combines Covered Software with other
material, in a separate file or files, that is not Covered Software.

1.8. "License" means this document.

1.9. "Licensable" means having the right to grant, to the maximum extent possible,
whether at the time of the initial grant or subsequently, any and all of the
rights conveyed by this License.

1.10. "Modifications" means any of the following: any file in Source Code Form
that results from an addition to, deletion from, or modification of the contents
of Covered Software; or any new file in Source Code Form that contains any
Covered Software.

2. License Grants and Conditions

2.1. Grants. Each Contributor hereby grants You a world-wide, royalty-free,
non-exclusive license: (a) under intellectual property rights (other than
patent or trademark) Licensable by such Contributor to use, reproduce, make
available, sell, resell, sublicense, and distribute the Covered Software, either
on an unmodified basis, with Modifications, or as part of a Larger Work; and
(b) under Patent Claims of such Contributor to make, use, sell, offer for sale,
have made, import, and otherwise transfer either its Contributions or its
Contributor Version.

2.2. Effective Date. The licenses granted in Section 2.1 with respect to any
Contribution become effective for each Contribution on the date the Contributor
first distributes such Contribution.

2.3. Limitations on Grant Scope. The licenses granted in this Section 2 are the
only rights granted under this License. No additional rights or licenses will
be implied from the distribution or licensing of Covered Software under this
License.

3. Responsibilities

3.1. Distribution of Source Form. All distribution of Covered Software in Source
Code Form, including any Modifications that You create or to which You
contribute, must be under the terms of this License.

3.2. Distribution of Executable Form. If You distribute Covered Software in
Executable Form then: (a) such Covered Software must also be made available in
Source Code Form, as described in Section 3.1, and You must inform recipients
of the Executable Form how they can obtain a copy of such Source Code Form; and
(b) You may distribute such Executable Form under the terms of this License.

4. Inability to Comply Due to Statute or Regulation. If it is impossible for
You to comply with any of the terms of this License with respect to some or all
of the Covered Software due to statute, judicial order, or regulation then You
must: (a) comply with the terms of this License to the maximum extent possible;
and (b) describe the limitations and the code they affect in the Source Code Form.

5. Termination. The rights granted under this License will terminate automatically
if You fail to comply with any of its terms.

6. Disclaimer of Warranty. Covered Software is provided under this License on an
"as is" basis, without warranty of any kind, either expressed, implied, or
statutory, including, without limitation, warranties that the Covered Software
is free of defects, merchantable, fit for a particular purpose or non-infringing.

7. Limitation of Liability. Under no circumstances and under no legal theory,
whether tort (including negligence), contract, or otherwise, shall any Contributor
be liable to You for any direct, indirect, special, incidental, or consequential
damages of any character including, without limitation, damages for lost profits,
loss of goodwill, work stoppage, computer failure or malfunction, or any and all
other commercial damages or losses.

Copyright (c) [year] [author]`,
  },
  {
    id: "unlicense",
    name: "Unlicense",
    spdx: "Unlicense",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: [],
    limitations: ["Liability", "Warranty"],
    text: `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute
this software, either in source code form or as a compiled binary, for any
purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors of this
software dedicate any and all copyright interest in the software to the public
domain. We make this dedication for the benefit of the public at large and to
the detriment of our heirs and successors. We intend this dedication to be an
overt act of relinquishment in perpetuity of all present and future rights to
this software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>`,
  },
  {
    id: "cc0",
    name: "CC0 1.0",
    spdx: "CC0-1.0",
    permissions: ["Commercial use", "Distribution", "Modification", "Private use"],
    conditions: [],
    limitations: ["Liability", "Patent use", "Trademark use", "Warranty"],
    text: `Creative Commons Legal Code

CC0 1.0 Universal

CREATIVE COMMONS CORPORATION IS NOT A LAW FIRM AND DOES NOT PROVIDE LEGAL
SERVICES. DISTRIBUTION OF THIS DOCUMENT DOES NOT CREATE AN ATTORNEY-CLIENT
RELATIONSHIP. CREATIVE COMMONS PROVIDES THIS INFORMATION ON AN "AS-IS" BASIS.
CREATIVE COMMONS MAKES NO WARRANTIES REGARDING THE USE OF THIS DOCUMENT OR THE
INFORMATION OR WORKS PROVIDED HEREUNDER, AND DISCLAIMS LIABILITY FOR DAMAGES
RESULTING FROM THE USE OF THIS DOCUMENT OR THE INFORMATION OR WORKS PROVIDED
HEREUNDER.

Statement of Purpose

The laws of most jurisdictions throughout the world automatically confer
exclusive Copyright and Related Rights (defined below) upon the creator and
subsequent owner(s) (each and all, an "owner") of an original work of authorship
and/or a database (each, a "Work").

Certain owners wish to permanently relinquish those rights to a Work for the
purpose of contributing to a commons of creative, cultural and scientific works
("Commons") that the public can reliably and without fear of infringement build
upon, modify, incorporate in other works, cite, and distribute, as freely as
possible in any form whatsoever and for any purposes, including without limitation
commercial purposes. These owners may contribute to the Commons to promote the
ideal of a free culture and the further production of creative, cultural and
scientific works, or to gain reputation or greater distribution for their Work
in part through the use and respect of others.

For these and/or other reasons and motivations, and without any expectation of
additional consideration or compensation, the person associating CC0 with a Work
(the "Affirmer"), to the extent that he or she is an owner of Copyright and
Related Rights in the Work, voluntarily elects to apply CC0 to the Work and
publicly distribute the Work under its terms, with knowledge of his or her
Copyright and Related Rights in the Work and the meaning and intended legal
effect of CC0 on those rights.

1. Copyright and Related Rights. A Work made available under CC0 may be
protected by copyright and related or neighboring rights ("Copyright and Related
Rights"). Copyright and Related Rights include, but are not limited to, the
following: i. the right to reproduce, adapt, distribute, perform, display,
communicate, and translate a Work; ii. moral rights retained by the original
author(s) and/or performer(s); iii. publicity and privacy rights pertaining to
a person's image or likeness depicted in a Work; iv. rights protecting against
unfair competition in regards to a Work, subject only to the limitations in
paragraph 4(a), below; v. rights protecting the extraction, dissemination, use
and reuse of data in a Work; vi. database rights (such as those arising under
Directive 96/9/EC of the European Parliament and of the Council of 11 March 1996
on the legal protection of databases, and under any national implementation
thereof, including any amended or updated version of such directive); and vii.
other similar, equivalent or corresponding rights throughout the world based on
applicable law or treaty.

2. Waiver. To the greatest extent permitted by, but not in contravention of,
applicable law, Affirmer hereby overtly, fully, permanently, irrevocably and
unconditionally waives, abandons, and surrenders all of Affirmer's Copyright and
Related Rights and associated claims and causes of action, whether now known or
unknown (including existing as well as future claims and causes of action), in
the Work (i) in all territories worldwide, (ii) for the maximum duration provided
by applicable law or treaty, (iii) in any current or future medium and for any
number of copies, and (iv) for any purpose whatsoever, including without
limitation commercial, advertising or promotional purposes.

3. Public License Fallback. Should any part of the Waiver for any reason be
judged legally invalid or ineffective under applicable law, then the Waiver shall
be preserved to the maximum extent permitted taking into account Affirmer's
express Statement of Purpose. In addition, to the extent the Waiver is so judged
Affirmer hereby grants to each affected person a royalty-free, non transferable,
non sublicensable, non exclusive, irrevocable and unconditional license to
exercise Affirmer's Copyright and Related Rights in the Work.

4. Limitations and Disclaimers.

   a. No trademark or patent rights held by Affirmer are waived, abandoned,
   surrendered, licensed or otherwise affected by this document.

   b. Affirmer offers the Work as-is and makes no representations or warranties
   of any kind concerning the Work, whether express, implied, statutory or
   otherwise, including without limitation warranties of title, merchantability,
   fitness for a particular purpose, non infringement, or the absence of latent
   or other defects, accuracy, or the present or absence of errors, whether or
   not discoverable, all to the greatest extent permissible under applicable law.

   c. Affirmer disclaims responsibility for clearing rights of other persons
   that may apply to the Work or any use thereof, including without limitation
   any person's Copyright and Related Rights in the Work.

   d. Affirmer understands and acknowledges that Creative Commons is not a party
   to this document and has no duty or obligation with respect to this CC0 or
   use of the Work.`,
  },
];

export function fillTemplate(template: string, year: string, author: string): string {
  return template
    .replace(/\[year\]/g, year || new Date().getFullYear().toString())
    .replace(/\[author\]/g, author || "Your Name");
}
